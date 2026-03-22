"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyReportService = void 0;
const rankingRepository_1 = require("../repository/rankingRepository");
const rankingUtils_1 = require("../utils/rankingUtils");
const weeklyRankingEmbed_1 = require("../ui/weeklyRankingEmbed");
const settingRepository_1 = require("../repository/settingRepository");
exports.weeklyReportService = {
    async postWeeklyReport(client, categoryId) {
        try {
            // ランキングチャンネル取得
            const rankingChannelId = await (0, settingRepository_1.getRankingChannelIdByCategoryId)(categoryId);
            const channel = await client.channels.fetch(rankingChannelId);
            if (!channel || !channel.isTextBased())
                return;
            const textChannel = channel;
            // 週間ランキング取得
            const weeklyRows = await rankingRepository_1.rankingRepository.getWeeklyRanking(categoryId, 10);
            const summary = await rankingRepository_1.rankingRepository.getWeeklySummary(categoryId);
            // entries に変換（embed が期待する形式）
            const weeklyEntries = (0, rankingUtils_1.toRankingEntriesWeekly)(weeklyRows);
            // embed 作成
            const embed = (0, weeklyRankingEmbed_1.createWeeklyRankingEmbed)(weeklyEntries, summary);
            // 投稿（履歴として残す）
            await textChannel.send({
                content: "📅 **今週の文明レポート**",
                embeds: [embed],
            });
        }
        catch (err) {
            console.error("WEEKLY REPORT ERROR:", err);
        }
    },
};
