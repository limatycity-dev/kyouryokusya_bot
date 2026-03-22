"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingService = void 0;
const rankingRepository_1 = require("../repository/rankingRepository");
const dataUtils_1 = require("../utils/dataUtils");
const rankingUtils_1 = require("../utils/rankingUtils");
const createCombinedRankingEmbed_1 = require("../ui/createCombinedRankingEmbed");
const SYSTEM_WEEKLY_KEY = "weekly_reset_key";
exports.rankingService = {
    async ensureWeeklyResetIfNeeded() {
        const currentKey = (0, dataUtils_1.getCurrentWeekKey)();
        const stored = await rankingRepository_1.rankingRepository.getSystemValue(SYSTEM_WEEKLY_KEY);
        // 同じ週 → 何もしない
        if (stored === currentKey) {
            return false;
        }
        // 週が変わった → リセット実行
        await rankingRepository_1.rankingRepository.resetWeekly();
        await rankingRepository_1.rankingRepository.setSystemValue(SYSTEM_WEEKLY_KEY, currentKey);
        return true;
    }, // ← ★ ここが重要（カンマ）
    // ============================================
    // 🆕 複合ランキング（リアルタイム＋週間）を描画
    // ============================================
    async updateRankingCombined(client, categoryId, rankingChannelId) {
        await this.ensureWeeklyResetIfNeeded();
        const channel = await client.channels.fetch(rankingChannelId);
        if (!channel || !channel.isTextBased())
            return;
        const textChannel = channel;
        // リアルタイムランキング取得
        const realtimeRows = await rankingRepository_1.rankingRepository.getRealtimeRanking(categoryId, 10);
        const realtimeEntries = (0, rankingUtils_1.toRankingEntriesTotal)(realtimeRows);
        // 週間ランキング取得
        const weeklyRows = await rankingRepository_1.rankingRepository.getWeeklyRanking(categoryId, 10);
        const weeklyEntries = (0, rankingUtils_1.toRankingEntriesWeekly)(weeklyRows);
        // 週間サマリー取得
        const summary = await rankingRepository_1.rankingRepository.getWeeklySummary(categoryId);
        // 複合ランキング embed 作成
        const embed = (0, createCombinedRankingEmbed_1.createCombinedRankingEmbed)(realtimeEntries, weeklyEntries, summary);
        // チャンネル内のメッセージを全削除して 1 つだけ描画
        const messages = await textChannel.messages.fetch({ limit: 50 });
        await Promise.all(messages.map((m) => m.delete().catch(() => { })));
        await textChannel.send({ embeds: [embed] });
    },
    // ============================================
    // 既存の関数は Combined を呼ぶだけに統合
    // ============================================
    async updateRealtimeRanking(client, categoryId, rankingChannelId) {
        return this.updateRankingCombined(client, categoryId, rankingChannelId);
    },
    async updateWeeklyRanking(client, categoryId, rankingChannelId) {
        return this.updateRankingCombined(client, categoryId, rankingChannelId);
    },
};
