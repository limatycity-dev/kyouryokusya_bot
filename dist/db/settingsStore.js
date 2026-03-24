"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingChannelIdByCategory = getRankingChannelIdByCategory;
const client_1 = require("./client");
async function getRankingChannelIdByCategory(categoryId) {
    const result = await client_1.db.query("SELECT ranking_channel_id FROM settings WHERE category_id = $1", [categoryId]);
    if ((result.rowCount ?? 0) === 0)
        return null;
    return {
        rankingChannelId: result.rows[0].ranking_channel_id,
    };
}
