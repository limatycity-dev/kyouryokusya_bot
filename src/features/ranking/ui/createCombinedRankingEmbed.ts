import { EmbedBuilder } from "discord.js";
import { RankingEntry, formatWeeklySummary } from "../utils/rankingUtils";
import { WeeklySummary } from "../repository/rankingRepository";

export function createCombinedRankingEmbed(
  realtime: RankingEntry[],
  weekly: RankingEntry[],
  summary: WeeklySummary
): EmbedBuilder {
  const realtimeText =
    realtime.length === 0
      ? "まだポイントが記録されていません。"
      : realtime
          .map((e) => `#${e.rank} <@${e.userId}> — **${e.points}pt**`)
          .join("\n");

  const weeklyText =
    weekly.length === 0
      ? "今週のポイントはまだありません。"
      : weekly
          .map((e) => `#${e.rank} <@${e.userId}> — **${e.points}pt**`)
          .join("\n");

  const summaryText = formatWeeklySummary(summary);

  return new EmbedBuilder()
    .setTitle("文明ランキング（総合＋週間）")
    .setColor(0xD2B48C)
    .addFields(
      {
        name: "🏆 総合ランキング（リアルタイム）",
        value: realtimeText,
      },
      {
        name: "📅 週間ランキング",
        value: weeklyText,
      },
      {
        name: "文明の今週の動き",
        value: summaryText,
      }
    )
    .setTimestamp(new Date());
}