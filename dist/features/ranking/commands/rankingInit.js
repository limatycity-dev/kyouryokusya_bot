"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
// src/features/ranking/commands/rankingInit.ts
const discord_js_1 = require("discord.js");
const client_1 = require("../../../db/client");
const createInitialRankingMessage_1 = require("../setup/createInitialRankingMessage");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("ranking-init")
    .setDescription("ランキングメッセージを初期化します。");
async function execute(interaction) {
    const channel = interaction.channel;
    if (!channel || !(channel instanceof discord_js_1.TextChannel)) {
        return interaction.reply("このコマンドはサーバー内のテキストチャンネルでのみ使用できます。");
    }
    const result = await client_1.db.query(`SELECT value FROM system WHERE key = 'ranking_message_id'`);
    if (result.rowCount > 0) {
        return interaction.reply("ランキングメッセージはすでに作成されています。");
    }
    try {
        await (0, createInitialRankingMessage_1.createInitialRankingMessage)(channel);
        await interaction.reply("ランキングメッセージを作成しました！");
    }
    catch (error) {
        console.error("RANKING INIT ERROR:", error);
        return interaction.reply("ランキングメッセージの作成に失敗しました。");
    }
}
