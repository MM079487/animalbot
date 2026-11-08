// MongoDB is the ONLY source of truth for daily message counts.
// Nothing is read from / written to a local json file anymore, so a redeploy on Render
// (which resets the disk back to whatever is in GitHub) can never roll the data back.
//
// Writes are atomic increments ($inc) – never "replace the whole document" – so even if an
// old and a new instance overlap during a deploy, counts only ever go up.

const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
    {
        _id: String,   // same label the chart uses, e.g. "10/25/2026"
        ts: Date,      // for sorting
        count: { type: Number, default: 0 },
        first: Object, // first message of that day  { author, iconURL, content }
        last: Object,  // most recent message of that day
    },
    { versionKey: false }
);

const Day = mongoose.models.DailyCount || mongoose.model("DailyCount", daySchema, "daily_counts");

const FLUSH_INTERVAL_MS = 5000;
const MAX_DAYS = 14;

let pending = {};   // { "10/25/2026": { inc, ts, first, last } } – waiting to be written
let inflight = {};  // batch currently being written (still counted when reading)
let flushing = false;
let started = false;

const todayLabel = () => new Date().toLocaleDateString(); // keep identical to the old key format

function mergeInto(target, day, p) {
    const t = target[day];
    if (!t) return void (target[day] = { ...p });
    t.inc += p.inc;
    t.last = p.last || t.last;
    if (p.ts < t.ts) { t.ts = p.ts; t.first = p.first; } // keep the earliest "first"
}

/** Call once on startup. Connects once and keeps the connection open. */
async function init() {
    if (started) return;
    started = true;
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
        console.log("✅ MongoDB connected (daily counts)");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        started = false; // allow retry
        setTimeout(init, 10000);
        return;
    }
    setInterval(flush, FLUSH_INTERVAL_MS);

    // Render sends SIGTERM when a new deploy replaces this instance – save what's pending first.
    process.on("SIGTERM", async () => {
        try { await Promise.all([flush(), require("./voiceCounts").flush()]); } finally { process.exit(0); }
    });
}

/** Record one message. Synchronous & cheap; written to MongoDB in batches. */
function record(message) {
    const day = todayLabel();
    const info = {
        author: message.author.username,
        iconURL: message.author.displayAvatarURL(),
        content: (message.content || "").slice(0, 300),
    };
    mergeInto(pending, day, { inc: 1, ts: new Date(), first: info, last: info });
}

async function flush() {
    if (flushing || mongoose.connection.readyState !== 1) return;
    const days = Object.keys(pending);
    if (!days.length) return;

    flushing = true;
    inflight = pending;
    pending = {};

    try {
        await Day.bulkWrite(
            days.map((day) => {
                const p = inflight[day];
                return {
                    updateOne: {
                        filter: { _id: day },
                        update: {
                            $inc: { count: p.inc },
                            $set: { last: p.last },
                            $setOnInsert: { ts: p.ts, first: p.first },
                        },
                        upsert: true,
                    },
                };
            }),
            { ordered: false }
        );
    } catch (err) {
        console.error("❌ Failed to save message counts, will retry:", err.message);
        for (const day of days) mergeInto(pending, day, inflight[day]); // put back, nothing lost
    } finally {
        inflight = {};
        flushing = false;
    }
}

/** { "10/24/2026": 160, "10/25/2026": 79, ... } oldest -> newest, includes not-yet-saved messages. */
async function getCounts(limit = MAX_DAYS) {
    const docs = await Day.find().sort({ ts: -1 }).limit(limit).lean();
    const out = {};
    for (const d of docs.reverse()) out[d._id] = d.count;

    for (const src of [inflight, pending]) {
        for (const [day, p] of Object.entries(src)) out[day] = (out[day] || 0) + p.inc;
    }
    return out;
}

/** Same shape the website expects: { 0: first message of latest day, 1: last message before it } */
async function getFirstLast() {
    const docs = await Day.find().sort({ ts: -1 }).limit(2).lean();
    if (!docs.length || !docs[0].first) return null;
    const latest = docs[0];
    const previous = docs[1];
    return { 0: latest.first, 1: (previous && previous.last) || latest.last || latest.first };
}

module.exports = { init, record, flush, getCounts, getFirstLast, Day };
