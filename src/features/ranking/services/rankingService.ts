import { TextChannel, Client } from "discord.js";
import { rankingRepository } from "../repository/rankingRepository";
import { getCurrentWeekKey } from "../utils/dataUtils";
import {
  toRankingEntriesTotal,
  toRankingEntriesWeekly,
} from "../utils/rankingUtils";
import { createCombinedRankingEmbed } from "../ui/createCombinedRankingEmbed";

const SYSTEM_WEEKLY_KEY = "weekly_reset_key";

export const rankingService = {
  async ensureWeeklyResetIfNeeded(): Promise<boolean> {
    const currentKey = getCurrentWeekKey();
    const stored = await rankingRepository.getSystemValue(SYSTEM_WEEKLY_KEY);

    // 同じ週 → 何もしない
    if (stored === currentKey) {
      return false;
    }

    // 週が変わった → リセット実行
    await rankingRepository.resetWeekly();
    await rankingRepository.setSystemValue(SYSTEM_WEEKLY_KEY, currentKey);

    return true;
  }, // ← ★ ここが重要（カンマ）

  // ============================================
  // 🆕 複合ランキング（リアルタイム＋週間）を描画
  // ============================================
  async updateRankingCombined(
    client: Client,
    categoryId: string,
    rankingChannelId: string
  ): Promise<void> {
    await this.ensureWeeklyResetIfNeeded();

    const channel = await client.channels.fetch(rankingChannelId);
    if (!channel || !channel.isTextBased()) return;

    const textChannel = channel as TextChannel;

    // リアルタイムランキング取得
    const realtimeRows = await rankingRepository.getRealtimeRanking(categoryId, 10);
    const realtimeEntries = toRankingEntriesTotal(realtimeRows);

    // 週間ランキング取得
    const weeklyRows = await rankingRepository.getWeeklyRanking(categoryId, 10);
    const weeklyEntries = toRankingEntriesWeekly(weeklyRows);

    // 週間サマリー取得
    const summary = await rankingRepository.getWeeklySummary(categoryId);

    // 複合ランキング embed 作成
    const embed = createCombinedRankingEmbed(
      realtimeEntries,
      weeklyEntries,
      summary
    );

    // チャンネル内のメッセージを全削除して 1 つだけ描画
    const messages = await textChannel.messages.fetch({ limit: 50 });
    await Promise.all(messages.map((m) => m.delete().catch(() => {})));

    await textChannel.send({ embeds: [embed] });
  },

  // ============================================
  // 既存の関数は Combined を呼ぶだけに統合
  // ============================================
  async updateRealtimeRanking(
    client: Client,
    categoryId: string,
    rankingChannelId: string
  ): Promise<void> {
    return this.updateRankingCombined(client, categoryId, rankingChannelId);
  },

  async updateWeeklyRanking(
    client: Client,
    categoryId: string,
    rankingChannelId: string
  ): Promise<void> {
    return this.updateRankingCombined(client, categoryId, rankingChannelId);
  },
};