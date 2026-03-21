// src/features/ranking/commands/rankingWeekly.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getWeeklyReport } from "../services/rankingService";
import { createWeeklyReportEmbed } from "../embeds/rankingEmbed";

export const data = new SlashCommandBuilder()
  .setName("ranking-weekly")
  .setDescription("文明の週次レポートを表示します。");

export async function execute(interaction: ChatInputCommandInteraction) {
  const report = await getWeeklyReport();
  const { embed, buttons } = createWeeklyReportEmbed(report);

  await interaction.reply({ embeds: [embed], components: [buttons] });
}