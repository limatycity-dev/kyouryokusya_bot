import { Client, TextChannel } from "discord.js";
import { rankingRepository } from "../repository/rankingRepository";
import { toRankingEntriesWeekly } from "../utils/rankingUtils";
import { createWeeklyRankingEmbed } from "../ui/weeklyRankingEmbed";
import { getRankingChannelIdByCategoryId } from "../repository/settingRepository";

export const weeklyReportService = {
  async postWeeklyReport(client: Client, categoryId: string): Promise<void> {
    try {
      // ランキングチャンネル取得
      const rankingChannelId = await getRankingChannelIdByCategoryId(categoryId);
      const channel = await client.channels.fetch(rankingChannelId);

      if (!channel || !channel.isTextBased()) return;
      const textChannel = channel as TextChannel;

      // 週間ランキング取得
      const weeklyRows = await rankingRepository.getWeeklyRanking(categoryId, 10);
      const summary = await rankingRepository.getWeeklySummary(categoryId);

      // entries に変換（embed が期待する形式）
      const weeklyEntries = toRankingEntriesWeekly(weeklyRows);

      // embed 作成
      const embed = createWeeklyRankingEmbed(weeklyEntries, summary);

      // 投稿（履歴として残す）
      await textChannel.send({
        content: "📅 **今週の文明レポート**",
        embeds: [embed],
      });
    } catch (err) {
      console.error("WEEKLY REPORT ERROR:", err);
    }
  },
};