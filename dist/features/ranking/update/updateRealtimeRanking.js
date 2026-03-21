"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRealtimeRanking = updateRealtimeRanking;
// src/features/ranking/update/updateRealtimeRanking.ts
const client_1 = require("../../../db/client");
const rankingService_1 = require("../services/rankingService");
const rankingEmbed_1 = require("../embeds/rankingEmbed");
async function updateRealtimeRanking(channel) {
    try {
        const result = await client_1.db.query(`SELECT value FROM system WHERE key = 'ranking_message_id'`);
        const messageId = result.rows[0]?.value;
        if (!messageId) {
            console.warn("⚠️ ranking_message_id が見つかりません");
            return false;
        }
        // メッセージ取得時のエラーハンドル
        let message;
        try {
            message = await channel.messages.fetch(messageId);
        }
        catch (err) {
            console.error("❌ ランキングメッセージが見つかりません (削除された可能性)", err);
            return false;
        }
        const ranking = await (0, rankingService_1.getRealtimeRanking)();
        // ✅ 修正: ボタン付き Embed を取得
        const { embed, buttons } = (0, rankingEmbed_1.createRankingEmbed)(ranking);
        // ✅ 修正: components を追加
        await message.edit({ embeds: [embed], components: [buttons] });
        console.log("✅ ランキング更新成功");
        return true;
    }
    catch (error) {
        console.error("❌ updateRealtimeRanking エラー:", error);
        return false;
    }
}
