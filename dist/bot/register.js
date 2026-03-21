"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommand = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("../db/client");
exports.registerCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("register")
        .setDescription("文明に参加します"),
    async execute(interaction) {
        const userId = interaction.user.id;
        const name = interaction.user.username;
        // すでに登録済みか確認
        const existing = await client_1.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        if (existing.rows.length > 0) {
            await interaction.reply("あなたはすでに文明に参加しています！");
            return;
        }
        // 新規登録
        await client_1.db.query("INSERT INTO users (id, name) VALUES ($1, $2)", [userId, name]);
        await interaction.reply("文明への参加が完了しました！");
    },
};
