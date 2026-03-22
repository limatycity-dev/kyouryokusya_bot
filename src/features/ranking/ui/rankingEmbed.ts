import { EmbedBuilder } from "discord.js";
import { RankingEntry } from "../utils/rankingUtils";

export function createRealtimeRankingEmbed(entries: RankingEntry[]): EmbedBuilder {
  const description =
    entries.length === 0
      ? "まだポイントが記録されていません。"
      : entries
          .map(
            (e) =>
              `#${e.rank} <@${e.userId}> — **${e.points}pt**`
          )
          .join("\n");

  return new EmbedBuilder()
    .setTitle("文明ランキング - 合計")
    .setDescription(description)
    .setColor(0xD2B48C)
    .setFooter({ text: "総合ランキング / 合計ポイント" })
    .setTimestamp(new Date());
}