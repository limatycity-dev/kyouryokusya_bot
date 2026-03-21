"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialRankingMessage = createInitialRankingMessage;
const client_1 = require("../../../db/client");
const rankingService_1 = require("../services/rankingService");
const rankingEmbed_1 = require("../embeds/rankingEmbed");
async function createInitialRankingMessage(channel) {
    const ranking = await (0, rankingService_1.getRealtimeRanking)();
    const { embed, buttons } = (0, rankingEmbed_1.createRankingEmbed)(ranking);
    const message = await channel.send({ embeds: [embed], components: [buttons] });
    await client_1.db.query(`INSERT INTO system (key, value) VALUES ('ranking_message_id', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [message.id]);
    console.log("✅ ランキングメッセージ作成成功");
}
