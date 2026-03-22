"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCommand = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("../../db/client");
const getCategoryId_1 = require("../../utils/getCategoryId");
exports.adminCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("admin")
        .setDescription("管理者を追加・削除します")
        .addSubcommand((sub) => sub
        .setName("add")
        .setDescription("ユーザーを管理者に追加する")
        .addUserOption((opt) => opt.setName("user").setDescription("追加するユーザー").setRequired(true)))
        .addSubcommand((sub) => sub
        .setName("remove")
        .setDescription("ユーザーを管理者から削除する")
        .addUserOption((opt) => opt.setName("user").setDescription("削除するユーザー").setRequired(true))),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser("user", true);
        // 共通関数でカテゴリID取得（仕様書準拠）
        const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
        console.log("CHANNEL TYPE:", interaction.channel?.type);
        console.log("CATEGORY ID:", await (0, getCategoryId_1.getCategoryId)(interaction.channel));
        if (!categoryId) {
            return interaction.reply({
                content: "このコマンドは文明カテゴリ内で実行してください。",
                ephemeral: true,
            });
        }
        // settings に存在する文明か確認
        const settingsRes = await client_1.db.query("SELECT 1 FROM settings WHERE category_id = $1", [categoryId]);
        if (settingsRes.rows.length === 0) {
            return interaction.reply({
                content: "このカテゴリは文明として登録されていません。",
                ephemeral: true,
            });
        }
        // 実行者が文明BOTの管理者か確認
        const adminCheck = await client_1.db.query("SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2", [categoryId, interaction.user.id]);
        if (adminCheck.rows.length === 0) {
            return interaction.reply({
                content: "あなたはこの文明の管理者ではありません。",
                ephemeral: true,
            });
        }
        // 管理者追加
        if (sub === "add") {
            await client_1.db.query(`INSERT INTO admins (category_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`, [categoryId, targetUser.id]);
            return interaction.reply({
                content: `${targetUser.username} さんを管理者に追加しました。`,
                ephemeral: true,
            });
        }
        // 管理者削除
        if (sub === "remove") {
            await client_1.db.query("DELETE FROM admins WHERE category_id = $1 AND user_id = $2", [categoryId, targetUser.id]);
            return interaction.reply({
                content: `${targetUser.username} さんを管理者から削除しました。`,
                ephemeral: true,
            });
        }
    },
};
