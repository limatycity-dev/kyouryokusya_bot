"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRankingEmbed = createRankingEmbed;
exports.createWeeklyReportEmbed = createWeeklyReportEmbed;
// src/features/ranking/embeds/rankingEmbed.ts
const discord_js_1 = require("discord.js");
function createRankingEmbed(data) {
    const pointsFormatted = data.points.map(p => `${p.toLocaleString()} pt`);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#3498db")
        .setTitle("🏆 総合ポイントランキング（リアルタイム）")
        .setDescription("いつも協力ありがとうございます！")
        .addFields({
        name: "順位",
        value: data.ranks.map(r => `**${r}位**`).join("\n") || "データなし",
        inline: true
    }, {
        name: "名前",
        value: data.names.join("\n") || "データなし",
        inline: true
    }, {
        name: "ポイント",
        value: pointsFormatted.join("\n") || "データなし",
        inline: true
    })
        .setFooter({ text: "最終更新: " })
        .setTimestamp();
    // ✅ ボタン追加
    const buttons = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("ranking_refresh")
        .setLabel("🔄 更新")
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId("ranking_weekly")
        .setLabel("📊 週間ランキング")
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return { embed, buttons };
}
function createWeeklyReportEmbed(data) {
    const pointsFormatted = data.points.map(p => `${p.toLocaleString()} pt`);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#f39c12")
        .setTitle("🌟 週間ランキング（今週のトップ貢献者）")
        .setDescription("この週の頑張り屋さんを表彲します！")
        .addFields({
        name: "順位",
        value: data.ranks.map(r => `**${r}位**`).join("\n") || "データなし",
        inline: true
    }, {
        name: "名前",
        value: data.names.join("\n") || "データなし",
        inline: true
    }, {
        name: "ポイント",
        value: pointsFormatted.join("\n") || "データなし",
        inline: true
    })
        .setFooter({ text: "最終更新: " })
        .setTimestamp();
    const buttons = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("ranking_back")
        .setLabel("⬅️ 総合ランキング")
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return { embed, buttons };
}
