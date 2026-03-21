"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestEditButton = handleQuestEditButton;
const discord_js_1 = require("discord.js");
async function handleQuestEditButton(interaction) {
    if (!interaction.customId.startsWith("quest_edit_"))
        return;
    const threadId = interaction.customId.replace("quest_edit_", "");
    // モーダル作成
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`quest_edit_modal_${threadId}`)
        .setTitle("クエスト編集");
    const titleInput = new discord_js_1.TextInputBuilder()
        .setCustomId("title")
        .setLabel("タイトル")
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false);
    const descInput = new discord_js_1.TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明")
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(false);
    const pointsInput = new discord_js_1.TextInputBuilder()
        .setCustomId("points")
        .setLabel("ポイント（数字）")
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false);
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(titleInput), new discord_js_1.ActionRowBuilder().addComponents(descInput), new discord_js_1.ActionRowBuilder().addComponents(pointsInput));
    await interaction.showModal(modal);
}
