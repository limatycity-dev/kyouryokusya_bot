"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wipeTotalCommand = void 0;
const discord_js_1 = require("discord.js");
const wipeService_1 = require("../services/wipeService");
const settingsStore_1 = require("../../../db/settingsStore");
const getCategoryId_1 = require("../../../utils/getCategoryId");
const isAdmin_1 = require("../../../utils/isAdmin");
exports.wipeTotalCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ranking-wipe-total")
        .setDescription("累計ランキングをリセットします（管理者のみ）"),
    async execute(interaction) {
        try {
            // 文明カテゴリ判定
            const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
            if (!categoryId) {
                return interaction.reply({
                    content: "文明カテゴリ内で実行してください。",
                    ephemeral: true,
                });
            }
            // 管理者チェック
            const ok = await (0, isAdmin_1.isAdmin)(interaction.user.id, interaction.guildId);
            if (!ok) {
                return interaction.reply({
                    content: "あなたはこの文明の管理者ではありません。",
                    ephemeral: true,
                });
            }
            // ランキングチャンネル取得
            const settings = await (0, settingsStore_1.getGuildSettings)(interaction.guildId);
            const rankingChannelId = settings?.rankingChannelId;
            if (!rankingChannelId) {
                return interaction.reply({
                    content: "ランキングチャンネルが設定されていません。",
                    ephemeral: true,
                });
            }
            // ワイプ実行
            await wipeService_1.wipeService.wipeTotalRanking(interaction.client, categoryId, rankingChannelId);
            // 成功メッセージ
            return interaction.reply({
                content: "🌙 文明の累計ランキングをリセットしました。\nすべての参加者が同じスタートラインに立ちました。",
            });
        }
        catch (error) {
            console.error("[ranking-wipe-total] Error:", error);
            return interaction.reply({
                content: "エラーが発生しました。もう一度お試しください。",
                ephemeral: true,
            });
        }
    },
};
