"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questCreateCommand = void 0;
// quest-create.ts
const discord_js_1 = require("discord.js");
exports.questCreateCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("quest-create")
        .setDescription("新しいクエストを作成します"),
    async execute(interaction) {
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId("quest_create_modal")
            .setTitle("クエストを作成");
        const titleInput = new discord_js_1.TextInputBuilder()
            .setCustomId("title")
            .setLabel("クエスト名")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const descInput = new discord_js_1.TextInputBuilder()
            .setCustomId("description")
            .setLabel("説明")
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setRequired(true);
        const typeInput = new discord_js_1.TextInputBuilder()
            .setCustomId("type")
            .setLabel("種類（空欄＝単発 / loop＝ループ）")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(false); // ← ここが重要！
        const pointsInput = new discord_js_1.TextInputBuilder()
            .setCustomId("points")
            .setLabel("ポイント")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(titleInput), new discord_js_1.ActionRowBuilder().addComponents(descInput), new discord_js_1.ActionRowBuilder().addComponents(typeInput), new discord_js_1.ActionRowBuilder().addComponents(pointsInput));
        await interaction.showModal(modal);
    },
};
