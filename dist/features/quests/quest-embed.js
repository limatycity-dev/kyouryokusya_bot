"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestEmbed = createQuestEmbed;
const discord_js_1 = require("discord.js");
function createQuestEmbed(quest) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#00AEEF")
        .setTitle(quest.title)
        .setDescription(quest.description)
        .addFields({ name: "ポイント", value: `${quest.points} pt`, inline: true }, { name: "タイプ", value: quest.type === "single" ? "単発" : "ループ", inline: true })
        .setTimestamp();
    const buttons = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`quest_complete_${quest.threadId}`) // ← threadId 使用
        .setLabel("✅ 達成する")
        .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
        .setCustomId(`quest_edit_modal_${quest.threadId}`) // ← threadId 使用
        .setLabel("✏️ 編集")
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId(`quest_close_${quest.threadId}`) // ✅ 修正: threadId 使用
        .setLabel("❌ 削除")
        .setStyle(discord_js_1.ButtonStyle.Danger));
    return { embed, buttons };
}
