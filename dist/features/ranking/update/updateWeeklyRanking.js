"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWeeklyRanking = updateWeeklyRanking;
const client_1 = require("../../../db/client");
const rankingService_1 = require("../services/rankingService");
const rankingEmbed_1 = require("../embeds/rankingEmbed");
async function updateWeeklyRanking(channel) {
    try {
        const result = await client_1.db.query(`SELECT value FROM system WHERE key = 'weekly_report_message_id'`);
        const messageId = result.rows[0]?.value;
        if (!messageId) {
            console.warn("⚠️ weekly_report_message_id が見つかりません");
            return false;
        }
        let message;
        try {
            message = await channel.messages.fetch(messageId);
        }
        catch (err) {
            console.error("❌ 週間レポートメッセージが見つかりません (削除された可能性)", err);
            return false;
        }
        const report = await (0, rankingService_1.getWeeklyReport)();
        const { embed, buttons } = (0, rankingEmbed_1.createWeeklyReportEmbed)(report);
        await message.edit({ embeds: [embed], components: [buttons] });
        console.log("✅ 週間レポート更新成功");
        return true;
    }
    catch (error) {
        console.error("❌ updateWeeklyRanking エラー:", error);
        return false;
    }
}
