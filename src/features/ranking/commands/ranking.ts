import { ChatInputCommandInteraction, SlashCommandBuilder, Client } from "discord.js";
import { rankingService } from "../services/rankingService";
import { getCategoryId } from "../../../utils/getCategoryId";
import { getRankingChannelIdByCategoryId } from "../repository/settingRepository";

export const rankingCommand = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("文明の総合ランキングを表示します。"),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    try {
      const categoryId = await getCategoryId(interaction.channel);
      if (!categoryId) {
        return interaction.reply({
          content: "カテゴリ内で実行してください。",
          ephemeral: true,
        });
      }

      const rankingChannelId = await getRankingChannelIdByCategoryId(categoryId);

      await rankingService.updateRealtimeRanking(client, categoryId, rankingChannelId);

      return interaction.reply({
        content: "ランキングを更新しました。",
        ephemeral: true,
      });
    } catch (error) {
      console.error("RANKING COMMAND ERROR:", error);
      return interaction.reply({
        content: "ランキングの更新中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  },
};