// ONE-TIME script: run locally with `node scripts/recoverCounts.js`
// Rebuilds the new daily_counts collection from the old "logs" snapshots.
// The old code saved a full snapshot every 5s (some were stale/rolled back), but a day's count
// only ever grows, so taking the MAX per day recovers the best data. Safe to run more than once.
require("dotenv").config()
const mongoose = require("mongoose")

;(async () => {
    await mongoose.connect(process.env.MONGO_URI)
    const db = mongoose.connection.db

    const rows = await db.collection("logs").aggregate([
        { $project: { d: { $objectToArray: "$data" } } },
        { $unwind: "$d" },
        { $group: { _id: "$d.k", count: { $max: "$d.v" } } },
    ], { allowDiskUse: true }).toArray()

    const ops = rows
        .filter(r => typeof r.count === "number" && !isNaN(new Date(r._id)))
        .map(r => ({
            updateOne: {
                filter: { _id: r._id },
                update: { $max: { count: r.count }, $setOnInsert: { ts: new Date(r._id) } },
                upsert: true,
            },
        }))

    if (ops.length) await db.collection("daily_counts").bulkWrite(ops)
    console.log(`Recovered ${ops.length} days:`, rows.map(r => `${r._id}=${r.count}`).join(", "))
    await mongoose.disconnect()
})().catch(e => { console.error(e); process.exit(1) })
