"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANKING_REFRESH_BUTTON_ID = void 0;
exports.createRankingRefreshButtonRow = createRankingRefreshButtonRow;
exports.handleRankingRefreshButton = handleRankingRefreshButton;
const discord_js_1 = require("discord.js");
const rankingService_1 = require("../services/rankingService");
const getCategoryId_1 = require("../../../utils/getCategoryId");
const settingRepository_1 = require("../repository/settingRepository");
exports.RANKING_REFRESH_BUTTON_ID = "ranking_refresh";
function createRankingRefreshButtonRow() {
    const button = new discord_js_1.ButtonBuilder()
        .setCustomId(exports.RANKING_REFRESH_BUTTON_ID)
        .setLabel("更新")
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return new discord_js_1.ActionRowBuilder().addComponents(button);
}
async function handleRankingRefreshButton(interaction, client) {
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
        await rankingService_1.rankingService.updateRealtimeRanking(client, categoryId, rankingChannelId);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "ランキングを更新しました。",
                ephemeral: true,
            });
        }
    }
    catch (error) {
        console.error("RANKING REFRESH BUTTON ERROR:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "ランキングの更新中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    }
}
