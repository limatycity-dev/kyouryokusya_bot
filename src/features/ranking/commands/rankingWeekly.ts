import { ChatInputCommandInteraction, SlashCommandBuilder, Client } from "discord.js";
import { rankingService } from "../services/rankingService";
import { getCategoryId } from "../../../utils/getCategoryId";
import { getRankingChannelIdByCategoryId } from "../repository/settingRepository";

export const rankingWeeklyCommand = {
  data: new SlashCommandBuilder()
    .setName("ranking-weekly")
    .setDescription("文明の週間ランキングを表示します。"),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
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

      await rankingService.updateWeeklyRanking(
        client,
        categoryId,
        rankingChannelId
      );

      return interaction.reply({
        content: "週間ランキングを更新しました。",
        ephemeral: true,
      });
    } catch (error) {
      console.error("RANKING WEEKLY COMMAND ERROR:", error);
      return interaction.reply({
        content: "週間ランキングの更新中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  },
};