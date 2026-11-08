// Daily voice-channel JOIN counts. Works exactly like dailyCounts.js:
// MongoDB is the only source of truth, writes are atomic $inc batches every few seconds,
// so a redeploy can never roll the numbers back.
//
// It re-uses the mongoose connection that dailyCounts.init() opens in server.js,
// and flush() simply waits until that connection is ready.

const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
    {
        _id: String,   // same label as the message chart, e.g. "10/25/2026"
        ts: Date,      // for sorting
        count: { type: Number, default: 0 },
    },
    { versionKey: false }
);

const VoiceDay = mongoose.models.DailyVoiceCount || mongoose.model("DailyVoiceCount", daySchema, "daily_voice_counts");

const FLUSH_INTERVAL_MS = 5000;
const MAX_DAYS = 14;

let pending = {};   // { "10/25/2026": { inc, ts } } – waiting to be written
let inflight = {};  // batch currently being written (still counted when reading)
let flushing = false;
let started = false;

const todayLabel = () => new Date().toLocaleDateString(); // identical key format to dailyCounts.js

function mergeInto(target, day, p) {
    const t = target[day];
    if (!t) return void (target[day] = { ...p });
    t.inc += p.inc;
    if (p.ts < t.ts) t.ts = p.ts;
}

/** Call once on startup. Only starts the periodic flush (connection is opened by dailyCounts.init). */
function init() {
    if (started) return;
    started = true;
    setInterval(flush, FLUSH_INTERVAL_MS);
}

/** Record one voice-channel join. Synchronous & cheap; written to MongoDB in batches. */
function record() {
    mergeInto(pending, todayLabel(), { inc: 1, ts: new Date() });
}

async function flush() {
    if (flushing || mongoose.connection.readyState !== 1) return;
    const days = Object.keys(pending);
    if (!days.length) return;

    flushing = true;
    inflight = pending;
    pending = {};

    try {
        await VoiceDay.bulkWrite(
            days.map((day) => ({
                updateOne: {
                    filter: { _id: day },
                    update: {
                        $inc: { count: inflight[day].inc },
                        $setOnInsert: { ts: inflight[day].ts },
                    },
                    upsert: true,
                },
            })),
            { ordered: false }
        );
    } catch (err) {
        console.error("❌ Failed to save voice join counts, will retry:", err.message);
        for (const day of days) mergeInto(pending, day, inflight[day]); // put back, nothing lost
    } finally {
        inflight = {};
        flushing = false;
    }
}

/** { "10/24/2026": 12, "10/25/2026": 7, ... } oldest -> newest, includes not-yet-saved joins. */
async function getCounts(limit = MAX_DAYS) {
    const docs = await VoiceDay.find().sort({ ts: -1 }).limit(limit).lean();
    const out = {};
    for (const d of docs.reverse()) out[d._id] = d.count;

    for (const src of [inflight, pending]) {
        for (const [day, p] of Object.entries(src)) out[day] = (out[day] || 0) + p.inc;
    }
    return out;
}

module.exports = { init, record, flush, getCounts, VoiceDay };
