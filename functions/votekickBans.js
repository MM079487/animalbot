// Temporary "can't join voice" bans created by /votekick.
// In-memory only: bans reset when the bot restarts.
const bans = new Map(); // `${guildId}:${userId}` -> expiry timestamp (ms)

const key = (guildId, userId) => `${guildId}:${userId}`;

function addBan(guildId, userId, durationMs) {
  bans.set(key(guildId, userId), Date.now() + durationMs);
}

// Remaining ms of the ban, or 0 if the user is not banned.
function getRemaining(guildId, userId) {
  const k = key(guildId, userId);
  const expiresAt = bans.get(k);
  if (!expiresAt) return 0;

  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    bans.delete(k);
    return 0;
  }
  return remaining;
}

module.exports = { addBan, getRemaining };
