"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const client_1 = require("../../../db/client");
const rankingService_1 = require("../services/rankingService");
const rankingEmbed_1 = require("../embeds/rankingEmbed");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("ranking")
    .setDescription("文明ポイントのリアルタイムランキングを更新します。");
async function execute(interaction) {
    const channel = interaction.channel;
    if (!channel || !(channel instanceof discord_js_1.TextChannel)) {
        return interaction.reply("このコマンドはサーバー内のテキストチャンネルでのみ使用できます。");
    }
    const result = await client_1.db.query(`SELECT value FROM system WHERE key = 'ranking_message_id'`);
    const messageId = result.rows[0]?.value;
    if (!messageId) {
        return interaction.reply("❌ ランキングメッセージがまだ作成されていません。\n`/ranking-init` を実行してください。");
    }
    try {
        const message = await channel.messages.fetch(messageId);
        const ranking = await (0, rankingService_1.getRealtimeRanking)();
        const { embed, buttons } = (0, rankingEmbed_1.createRankingEmbed)(ranking);
        await message.edit({ embeds: [embed], components: [buttons] });
        await interaction.reply("✅ ランキングを更新しました！");
    }
    catch (error) {
        console.error("❌ ランキング更新エラー:", error);
        return interaction.reply("❌ ランキングメッセージの更新に失敗しました。\n`/ranking-init` コマンドを実行してください。");
    }
}
