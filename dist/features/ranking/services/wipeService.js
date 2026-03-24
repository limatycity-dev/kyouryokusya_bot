"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wipeService = void 0;
const rankingRepository_1 = require("../repository/rankingRepository");
const rankingService_1 = require("./rankingService");
exports.wipeService = {
    async wipeTotalRanking(client, categoryId, rankingChannelId) {
        try {
            // 1. 累計ポイントをリセット
            await rankingRepository_1.rankingRepository.resetTotalPoints(categoryId);
            // 2. ランキングチャンネルを取得
            const channel = await client.channels.fetch(rankingChannelId);
            if (!channel || !channel.isTextBased())
                return;
            const textChannel = channel;
            // 3. メッセージ全削除
            const messages = await textChannel.messages.fetch({ limit: 50 });
            await Promise.all(messages.map((m) => m.delete().catch(() => { })));
            // 4. 最新ランキングを再描画
            await rankingService_1.rankingService.updateRankingCombined(client, categoryId, rankingChannelId);
        }
        catch (error) {
            console.error("[wipeService.wipeTotalRanking] Error:", error);
            throw new Error("累計ランキングのリセットに失敗しました。");
        }
    },
};
