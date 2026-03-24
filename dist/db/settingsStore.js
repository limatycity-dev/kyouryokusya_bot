"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildSettings = getGuildSettings;
const client_1 = require("./client");
async function getGuildSettings(guildId) {
    const result = await client_1.db.query("SELECT ranking_channel_id FROM settings WHERE guild_id = $1", [guildId]);
    if ((result.rowCount ?? 0) === 0)
        return null;
    return {
        rankingChannelId: result.rows[0].ranking_channel_id,
    };
}
