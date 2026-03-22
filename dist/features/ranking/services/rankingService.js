"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingService = void 0;
const rankingRepository_1 = require("../repository/rankingRepository");
const dataUtils_1 = require("../utils/dataUtils");
const rankingUtils_1 = require("../utils/rankingUtils");
const rankingEmbed_1 = require("../ui/rankingEmbed");
const weeklyRankingEmbed_1 = require("../ui/weeklyRankingEmbed");
const SYSTEM_WEEKLY_KEY = "weekly_reset_key";
exports.rankingService = {
    async ensureWeeklyResetIfNeeded() {
        const currentKey = (0, dataUtils_1.getCurrentWeekKey)();
        const stored = await rankingRepository_1.rankingRepository.getSystemValue(SYSTEM_WEEKLY_KEY);
        if (stored === currentKey)
            return;
        await rankingRepository_1.rankingRepository.resetWeekly();
        await rankingRepository_1.rankingRepository.setSystemValue(SYSTEM_WEEKLY_KEY, currentKey);
    },
    async updateRealtimeRanking(client, categoryId, rankingChannelId) {
        const channel = await client.channels.fetch(rankingChannelId);
        if (!channel || !channel.isTextBased())
            return;
        const textChannel = channel;
        const rows = await rankingRepository_1.rankingRepository.getRealtimeRanking(categoryId, 10);
        const entries = (0, rankingUtils_1.toRankingEntriesTotal)(rows);
        const embed = (0, rankingEmbed_1.createRealtimeRankingEmbed)(entries);
        const messages = await textChannel.messages.fetch({ limit: 50 });
        await Promise.all(messages.map((m) => m.delete().catch(() => { })));
        await textChannel.send({ embeds: [embed] });
    },
    async updateWeeklyRanking(client, categoryId, rankingChannelId) {
        await this.ensureWeeklyResetIfNeeded();
        const channel = await client.channels.fetch(rankingChannelId);
        if (!channel || !channel.isTextBased())
            return;
        const textChannel = channel;
        const rows = await rankingRepository_1.rankingRepository.getWeeklyRanking(categoryId, 10);
        const summary = await rankingRepository_1.rankingRepository.getWeeklySummary(categoryId);
        const entries = (0, rankingUtils_1.toRankingEntriesWeekly)(rows);
        const embed = (0, weeklyRankingEmbed_1.createWeeklyRankingEmbed)(entries, summary);
        const messages = await textChannel.messages.fetch({ limit: 50 });
        await Promise.all(messages.map((m) => m.delete().catch(() => { })));
        await textChannel.send({ embeds: [embed] });
    },
};
