"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeeklyRankingEmbed = createWeeklyRankingEmbed;
const discord_js_1 = require("discord.js");
const rankingUtils_1 = require("../utils/rankingUtils");
function createWeeklyRankingEmbed(entries, summary) {
    const rankingText = entries.length === 0
        ? "今週のポイントはまだありません。"
        : entries
            .map((e) => `#${e.rank} <@${e.userId}> — **${e.points}pt**`)
            .join("\n");
    const summaryText = (0, rankingUtils_1.formatWeeklySummary)(summary);
    return new discord_js_1.EmbedBuilder()
        .setTitle("文明ランキング - 今週")
        .setDescription(rankingText)
        .addFields({
        name: "文明の今週の動き",
        value: summaryText,
    })
        .setColor(0xD2B48C)
        .setFooter({ text: "週間ランキング / 今週のポイント" })
        .setTimestamp(new Date());
}
