import { EmbedBuilder } from "discord.js";
import { RankingEntry, formatWeeklySummary } from "../utils/rankingUtils";
import { WeeklySummary } from "../repository/rankingRepository";

export function createWeeklyRankingEmbed(
  entries: RankingEntry[],
  summary: WeeklySummary
): EmbedBuilder {
  const rankingText =
    entries.length === 0
      ? "今週のポイントはまだありません。"
      : entries
          .map(
            (e) =>
              `#${e.rank} <@${e.userId}> — **${e.points}pt**`
          )
          .join("\n");

  const summaryText = formatWeeklySummary(summary);

  return new EmbedBuilder()
    .setTitle("文明ランキング - 今週")
    .setDescription(rankingText)
    .addFields({
      name: "文明の今週の動き",
      value: summaryText,
    })
    .setColor(0xD2B48C)
    .setFooter({ text: "週間ランキング / 今週のポイント" })
    .setTimestamp(new Date());
}