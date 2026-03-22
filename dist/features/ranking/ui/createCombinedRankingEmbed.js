"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCombinedRankingEmbed = createCombinedRankingEmbed;
const discord_js_1 = require("discord.js");
const rankingUtils_1 = require("../utils/rankingUtils");
function createCombinedRankingEmbed(realtime, weekly, summary) {
    const realtimeText = realtime.length === 0
        ? "まだポイントが記録されていません。"
        : realtime
            .map((e) => `#${e.rank} <@${e.userId}> — **${e.points}pt**`)
            .join("\n");
    const weeklyText = weekly.length === 0
        ? "今週のポイントはまだありません。"
        : weekly
            .map((e) => `#${e.rank} <@${e.userId}> — **${e.points}pt**`)
            .join("\n");
    const summaryText = (0, rankingUtils_1.formatWeeklySummary)(summary);
    return new discord_js_1.EmbedBuilder()
        .setTitle("文明ランキング（総合＋週間）")
        .setColor(0xD2B48C)
        .addFields({
        name: "🏆 総合ランキング（リアルタイム）",
        value: realtimeText,
    }, {
        name: "📅 週間ランキング",
        value: weeklyText,
    }, {
        name: "文明の今週の動き",
        value: summaryText,
    })
        .setTimestamp(new Date());
}
