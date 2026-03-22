"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommand = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("../../../db/client");
exports.registerCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("register")
        .setDescription("ユーザーを登録します")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const name = interaction.user.username;
            // 既存チェック（rows.length を使用）
            const existing = await client_1.db.query("SELECT 1 FROM users WHERE user_id = $1", [userId]);
            if (existing.rows.length > 0) {
                return interaction.reply({
                    content: "すでに登録されています。",
                    ephemeral: true,
                });
            }
            // INSERT（DEFAULT カラムは自動で入る）
            await client_1.db.query("INSERT INTO users (user_id, name) VALUES ($1, $2)", [userId, name]);
            return interaction.reply({
                content: `${name} さんを登録しました！`,
                ephemeral: true,
            });
        }
        catch (error) {
            console.error("REGISTER ERROR:", error);
            return interaction.reply({
                content: "登録中にエラーが発生しました。管理者に連絡してください。",
                ephemeral: true,
            });
        }
    },
};
