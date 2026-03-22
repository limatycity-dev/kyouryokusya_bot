import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } from "discord.js";
import { rankingService } from "../services/rankingService";
import { getCategoryId } from "../../../utils/getCategoryId";
import { getRankingChannelIdByCategoryId } from "../repository/settingRepository";

export const RANKING_REFRESH_BUTTON_ID = "ranking_refresh";

export function createRankingRefreshButtonRow() {
  const button = new ButtonBuilder()
    .setCustomId(RANKING_REFRESH_BUTTON_ID)
    .setLabel("更新")
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

export async function handleRankingRefreshButton(
  interaction: ButtonInteraction,
  client: Client
) {
  try {
    // ★ async getCategoryId は必ず await が必要
    const categoryId = await getCategoryId(interaction.channel);

    if (!categoryId) {
      return interaction.reply({
        content: "カテゴリ内で実行してください。",
        ephemeral: true,
      });
    }

    const rankingChannelId = await getRankingChannelIdByCategoryId(categoryId);

    await rankingService.updateRealtimeRanking(
      client,
      categoryId,
      rankingChannelId
    );

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "ランキングを更新しました。",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("RANKING REFRESH BUTTON ERROR:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "ランキングの更新中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  }
}