"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questCreateCommand = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("../../db/client");
const getCategoryId_1 = require("../../utils/getCategoryId");
exports.questCreateCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("quest-create")
        .setDescription("新しいクエストを作成します"),
    async execute(interaction) {
        // カテゴリID取得（仕様書準拠）
        const categoryId = (0, getCategoryId_1.getCategoryId)(interaction.channel);
        if (!categoryId) {
            return interaction.reply({
                content: "このコマンドは文明カテゴリ内で実行してください。",
                ephemeral: true,
            });
        }
        // 管理者チェック（仕様書準拠）
        const adminCheck = await client_1.db.query("SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2", [categoryId, interaction.user.id]);
        if (adminCheck.rowCount === 0) {
            return interaction.reply({
                content: "あなたはこの文明の管理者ではありません。",
                ephemeral: true,
            });
        }
        // モーダル作成（仕様書準拠：type を入力させる）
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
        const pointsInput = new discord_js_1.TextInputBuilder()
            .setCustomId("points")
            .setLabel("ポイント")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const typeInput = new discord_js_1.TextInputBuilder()
            .setCustomId("type")
            .setLabel("種類（空欄＝single / loop）")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(false); // 空欄OK
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(titleInput), new discord_js_1.ActionRowBuilder().addComponents(descInput), new discord_js_1.ActionRowBuilder().addComponents(pointsInput), new discord_js_1.ActionRowBuilder().addComponents(typeInput));
        await interaction.showModal(modal);
    },
};
