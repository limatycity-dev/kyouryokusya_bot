"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testdbCommand = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("../db/client");
exports.testdbCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("testdb")
        .setDescription("DB に接続できるか確認します"),
    async execute(interaction) {
        try {
            const result = await client_1.db.query("SELECT NOW()");
            await interaction.reply(`DB OK: ${result.rows[0].now}`);
        }
        catch (error) {
            console.error(error);
            await interaction.reply("DB 接続に失敗しました。");
        }
    },
};
