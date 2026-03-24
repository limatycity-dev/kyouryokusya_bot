import { Client, TextChannel } from "discord.js";
import { rankingRepository } from "../repository/rankingRepository";
import { rankingService } from "./rankingService";

export const wipeService = {
  async wipeTotalRanking(
    client: Client,
    categoryId: string,
    rankingChannelId: string
  ): Promise<void> {
    try {
      // 1. 累計ポイントをリセット
      await rankingRepository.resetTotalPoints(categoryId);

      // 2. ランキングチャンネルを取得
      const channel = await client.channels.fetch(rankingChannelId);
      if (!channel || !channel.isTextBased()) return;
      const textChannel = channel as TextChannel;

      // 3. メッセージ全削除
      const messages = await textChannel.messages.fetch({ limit: 50 });
      await Promise.all(messages.map((m) => m.delete().catch(() => {})));

      // 4. 最新ランキングを再描画
      await rankingService.updateRankingCombined(
        client,
        categoryId,
        rankingChannelId
      );

    } catch (error) {
      console.error("[wipeService.wipeTotalRanking] Error:", error);
      throw new Error("累計ランキングのリセットに失敗しました。");
    }
  },
};