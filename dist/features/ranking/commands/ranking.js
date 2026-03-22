"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingCommand = void 0;
const discord_js_1 = require("discord.js");
const rankingService_1 = require("../services/rankingService");
const getCategoryId_1 = require("../../../utils/getCategoryId");
const settingRepository_1 = require("../repository/settingRepository");
exports.rankingCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ranking")
        .setDescription("文明の総合ランキングを表示します。"),
    async execute(interaction, client) {
        try {
            const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
            if (!categoryId) {
                return interaction.reply({
                    content: "カテゴリ内で実行してください。",
                    ephemeral: true,
                });
            }
            const rankingChannelId = await (0, settingRepository_1.getRankingChannelIdByCategoryId)(categoryId);
            await rankingService_1.rankingService.updateRealtimeRanking(client, categoryId, rankingChannelId);
            return interaction.reply({
                content: "ランキングを更新しました。",
                ephemeral: true,
            });
        }
        catch (error) {
            console.error("RANKING COMMAND ERROR:", error);
            return interaction.reply({
                content: "ランキングの更新中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    },
};
