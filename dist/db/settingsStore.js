"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildSettings = getGuildSettings;
const client_1 = require("./client"); // ← これが正しい
async function getGuildSettings(guildId) {
    const result = await client_1.db.query("SELECT ranking_channel_id, realtime_message_id, weekly_message_id FROM settings WHERE guild_id = $1", [guildId]);
    if (result.rowCount === 0)
        return null;
    return {
        rankingChannelId: result.rows[0].ranking_channel_id,
        realtimeMessageId: result.rows[0].realtime_message_id,
        weeklyMessageId: result.rows[0].weekly_message_id,
    };
}
