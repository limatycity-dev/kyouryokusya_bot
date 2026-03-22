"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRealtimeRankingEmbed = createRealtimeRankingEmbed;
const discord_js_1 = require("discord.js");
function createRealtimeRankingEmbed(entries) {
    const description = entries.length === 0
        ? "まだポイントが記録されていません。"
        : entries
            .map((e) => `#${e.rank} <@${e.userId}> — **${e.points}pt**`)
            .join("\n");
    return new discord_js_1.EmbedBuilder()
        .setTitle("文明ランキング - 合計")
        .setDescription(description)
        .setColor(0xD2B48C)
        .setFooter({ text: "総合ランキング / 合計ポイント" })
        .setTimestamp(new Date());
}
