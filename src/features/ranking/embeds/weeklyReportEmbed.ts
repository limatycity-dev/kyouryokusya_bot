// src/features/ranking/embeds/weeklyReportEmbed.ts
import { EmbedBuilder } from "discord.js";

export interface WeeklyReportData {
  ranks: string[];
  names: string[];
  points: number[];
  created: number[];
  completed: number[];
}

export function createWeeklyReportEmbed(data: WeeklyReportData) {
  return new EmbedBuilder()
    .setColor("#3498db")
    .setTitle("📅 今週のレポート")
    .setDescription("今週のポイント変動ランキング")
    .addFields(
      { name: "順位", value: data.ranks.join("\n"), inline: true },
      { name: "名前", value: data.names.join("\n"), inline: true },
      { name: "増加ポイント", value: data.points.join("\n"), inline: true },
      { name: "発行タスク", value: data.created.join("\n"), inline: true },
      { name: "完了タスク", value: data.completed.join("\n"), inline: true },
    );
}