"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingWeeklyCommand = void 0;
const discord_js_1 = require("discord.js");
const rankingService_1 = require("../services/rankingService");
const getCategoryId_1 = require("../../../utils/getCategoryId");
const settingRepository_1 = require("../repository/settingRepository");
exports.rankingWeeklyCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ranking-weekly")
        .setDescription("文明の週間ランキングを表示します。"),
    async execute(interaction, client) {
        try {
            // ★ async getCategoryId は必ず await が必要
            const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
            if (!categoryId) {
                return interaction.reply({
                    content: "カテゴリ内で実行してください。",
                    ephemeral: true,
                });
            }
            const rankingChannelId = await (0, settingRepository_1.getRankingChannelIdByCategoryId)(categoryId);
            await rankingService_1.rankingService.updateWeeklyRanking(client, categoryId, rankingChannelId);
            return interaction.reply({
                content: "週間ランキングを更新しました。",
                ephemeral: true,
            });
        }
        catch (error) {
            console.error("RANKING WEEKLY COMMAND ERROR:", error);
            return interaction.reply({
                content: "週間ランキングの更新中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    },
};
