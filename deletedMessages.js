// MongoDB-backed log of deleted/edited messages (what used to live in public/index/data.json).
// Render's disk is reset to the GitHub copy on every deploy, so the log now lives in MongoDB.
// Uses the same mongoose connection that dailyCounts.init() opens in server.js.

const mongoose = require("mongoose");

const MAX_RECORDS = 30;
const CACHE_MS = 1000; // the website polls every 0.5s, don't hit MongoDB for each poll

// strict:false -> store whatever fields the logger sends (name, message, attachment, ...)
const schema = new mongoose.Schema({ _id: String }, { strict: false, versionKey: false });
const Rec = mongoose.models.DeletedMessage || mongoose.model("DeletedMessage", schema, "deleted_messages");
const col = () => Rec.collection; // native driver collection, no casting surprises

let cache = null;
let cacheAt = 0;

/** Add a record. Same message (same createdTimestamp) overwrites its old record, like before. */
async function add(data) {
    try {
        const _id = String(data.time);
        const existing = await col().findOne({ _id }, { projection: { at: 1 } });
        // `at` = when it was first logged; keeps insertion order like the old json file did
        await col().replaceOne({ _id }, { ...data, at: existing ? existing.at : Date.now() }, { upsert: true });

        // keep only the newest MAX_RECORDS
        const extra = await col().find({}, { projection: { _id: 1 } }).sort({ at: -1 }).skip(MAX_RECORDS).toArray();
        if (extra.length) await col().deleteMany({ _id: { $in: extra.map((d) => d._id) } });
    } catch (err) {
        console.error("❌ Failed to save deleted/edited message:", err.message);
    } finally {
        cache = null;
    }
}

/** Remove the most recently logged record (/remove_last_msg). */
async function deleteLast() {
    try {
        const [last] = await col().find({}).sort({ at: -1 }).limit(1).toArray();
        if (last) await col().deleteOne({ _id: last._id });
    } catch (err) {
        console.error("❌ Failed to delete last record:", err.message);
    } finally {
        cache = null;
    }
}

/** Same shape the website / check_last_record expect: { "<time>": {...record}, ... } oldest -> newest */
async function getAll() {
    if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
    const docs = await col().find({}).sort({ at: 1 }).toArray();
    const out = {};
    for (const { _id, at, ...rest } of docs) out[rest.time] = rest;
    cache = out;
    cacheAt = Date.now();
    return out;
}

module.exports = { add, deleteLast, getAll };
