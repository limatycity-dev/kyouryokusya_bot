"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestEmbed = createQuestEmbed;
const discord_js_1 = require("discord.js");
function createQuestEmbed(quest) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#2ECC71") // 仕様書のクエストテーマカラー
        .setTitle(quest.title)
        .setDescription(quest.description)
        .addFields({ name: "ポイント", value: `${quest.points} pt`, inline: true }, { name: "タイプ", value: quest.type === "single" ? "単発" : "ループ", inline: true }, { name: "ステータス", value: quest.status === "closed" ? "終了" : "進行中", inline: true }, ...(quest.issuerName
        ? [{ name: "発行者", value: quest.issuerName, inline: true }]
        : []))
        .setTimestamp();
    const buttons = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`quest_complete_${quest.questId}`) // questId を使用
        .setLabel("✅ 達成する")
        .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
        .setCustomId(`quest_edit_${quest.questId}`) // questId を使用
        .setLabel("✏️ 編集")
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId(`quest_close_${quest.questId}`) // questId を使用
        .setLabel("❌ 終了")
        .setStyle(discord_js_1.ButtonStyle.Danger));
    return { embed, buttons };
}
