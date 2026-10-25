const { EmbedBuilder } = require("discord.js")
require('dotenv').config()

// Stations to track.
// `uid` is the full feed id: "@number" for WAQI stations, "A" + number for external ones.
// If `uid` is a plain number, the script tries both formats.
// If `uid` is not set, the script searches WAQI with `keyword` and
// filters by `match` (case-insensitive station name).
const STATIONS = [
    { label: "ENVIRO EXCELTECH SDN BHD, Seri Kembangan", uid: "A2373892" },
    { label: "Tangkak", uid: "@10484" },
    { label: "Central, Singapore", uid: "@1666" },
];

const THRESHOLD = 150;
const BASE_URL = "https://api.waqi.info";

// Pollutant sub-indices in `iaqi` (excludes weather values like t, h, p, w)
const POLLUTANTS = ["pm25", "pm10", "o3", "no2", "so2", "co"];

// Resolved station uids (cached after first successful lookup)
const resolvedUids = new Map();

// Feed id format that worked for each station (e.g. "@10484" or "A2373892")
const workingFeedIds = new Map();

// Per-station state: true = already alerted for the current exceedance
const alerted = new Map();

async function resolveStationUid(station) {
    // Hardcoded uid -> no search needed
    if (station.uid) return station.uid;
    if (resolvedUids.has(station.label)) return resolvedUids.get(station.label);

    const url = new URL(`${BASE_URL}/search/`);
    url.searchParams.set("token", process.env.HAZE_API);
    url.searchParams.set("keyword", station.keyword);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} while searching for ${station.label}`);
    }

    const json = await res.json();
    if (json.status !== "ok" || !Array.isArray(json.data)) {
        throw new Error(`Search failed for ${station.label}: ${JSON.stringify(json.data)}`);
    }

    const found = json.data.find(s =>
        s.station?.name?.toLowerCase().includes(station.match)
    );
    if (!found) throw new Error(`Station not found: ${station.label}`);

    resolvedUids.set(station.label, found.uid);
    return found.uid;
}

// Request one feed id. Returns the station data, or throws with the API's message.
async function requestFeed(feedId) {
    const url = new URL(`${BASE_URL}/feed/${feedId}/`);
    url.searchParams.set("token", process.env.HAZE_API);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    // Errors can show up either at the top level or nested inside `data`
    const nestedError = json.data && typeof json.data === "object" && json.data.status === "error";
    if (json.status !== "ok" || nestedError) {
        const msg = typeof json.data === "string" ? json.data : (json.data?.msg ?? JSON.stringify(json));
        throw new Error(msg);
    }
    return json.data;
}

async function fetchStation(station) {
    const uid = await resolveStationUid(station);

    // Build the list of feed ids to try
    let candidates;
    if (workingFeedIds.has(station.label)) {
        candidates = [workingFeedIds.get(station.label)];
    } else if (typeof uid === "string" && /^[@A]/i.test(uid)) {
        candidates = [uid]; // full feed id supplied
    } else {
        candidates = [`@${uid}`, `A${uid}`];
    }

    let lastError;
    for (const feedId of candidates) {
        try {
            const data = await requestFeed(feedId);
            workingFeedIds.set(station.label, feedId);
            return data;
        } catch (error) {
            lastError = error;
        }
    }
    throw new Error(`No working feed id for ${station.label}: ${lastError?.message}`);
}

// Use data.aqi when present. Otherwise fall back to the highest
// pollutant sub-index in iaqi (the overall AQI is the max of these).
function extractAqi(data) {
    const direct = Number(data.aqi);
    if (data.aqi !== undefined && data.aqi !== "-" && !Number.isNaN(direct)) {
        return direct;
    }

    const values = POLLUTANTS
        .map(p => Number(data.iaqi?.[p]?.v))
        .filter(v => !Number.isNaN(v));

    return values.length ? Math.max(...values) : NaN;
}

const sendHazeReport = (client) => {

    setInterval(checkAPI, 600000); // update every 10 minutes

    // Run once on startup, but only after the bot is logged in,
    // otherwise the channel can't be found yet.
    if (client.isReady()) {
        checkAPI();
    } else {
        client.once("ready", checkAPI);
    }

    async function checkAPI() {
        for (const station of STATIONS) {
            try {
                const data = await fetchStation(station);
                const aqi = extractAqi(data);

                // No usable reading -> skip this cycle
                if (Number.isNaN(aqi)) continue;

                // At or below threshold -> reset so the next exceedance alerts again
                if (aqi <= THRESHOLD) {
                    alerted.set(station.label, false);
                    continue;
                }

                // Already alerted for this exceedance -> skip
                if (alerted.get(station.label)) continue;

                const iaqi = data.iaqi || {};
                const pm25 = iaqi.pm25?.v ?? "暂无数据";
                const pm10 = iaqi.pm10?.v ?? "暂无数据";

                const embed = new EmbedBuilder()
                    .setTitle(`雾霾指数警报 \(${station.label}\)`)
                    .setColor("Red")
                    .addFields([
                        {name: "空气质量指数 (AQI)：", value: `**${aqi}**`},
                        {name: "详细信息: ", value: `
                        PM2.5：${pm25}
                        PM10：${pm10}
                        主要污染物：${data.dominentpol ?? "暂无数据"}
                        时间：${data.time?.s ?? "暂无数据"}
                        `}
                    ])

                // fetch() works even if the channel isn't in the cache yet
                const channel = await client.channels.fetch(process.env.channelId).catch(() => null);
                if (!channel) {
                    console.error(`Haze report: channel not found (${process.env.channelId})`);
                    continue;
                }

                await channel.send({ embeds: [embed] });
                alerted.set(station.label, true);
            } catch (error) {
                console.error(`Failed to fetch haze API (${station.label}):`, error);
            }
        }
    }
}

module.exports = { sendHazeReport }