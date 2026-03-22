"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingChannelIdByCategoryId = getRankingChannelIdByCategoryId;
const client_1 = require("../../../db/client");
async function getRankingChannelIdByCategoryId(categoryId) {
    const result = await client_1.db.query(`SELECT ranking_channel_id FROM settings WHERE category_id = $1`, [categoryId]);
    if (!result.rows[0])
        throw new Error("Ranking channel not found");
    return result.rows[0].ranking_channel_id;
}
