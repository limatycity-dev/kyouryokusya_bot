import { ChatInputCommandInteraction, SlashCommandBuilder, Client, TextChannel } from "discord.js";
import { getCategoryId } from "../../../utils/getCategoryId";
import { getRankingChannelIdByCategoryId } from "../repository/settingRepository";

export const rankingInitCommand = {
  data: new SlashCommandBuilder()
    .setName("ranking-init")
    .setDescription("ランキングチャンネルを初期化します。"),

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
      const channel = await client.channels.fetch(rankingChannelId);
      if (!channel || !channel.isTextBased()) {
        return interaction.reply({
          content: "ランキングチャンネルが見つかりませんでした。",
          ephemeral: true,
        });
      }

      const textChannel = channel as TextChannel;
      const messages = await textChannel.messages.fetch({ limit: 100 });
      await Promise.all(messages.map((m) => m.delete().catch(() => {})));

      return interaction.reply({
        content: "ランキングチャンネルを初期化しました。",
        ephemeral: true,
      });
    } catch (error) {
      console.error("RANKING INIT COMMAND ERROR:", error);
      return interaction.reply({
        content: "ランキングチャンネルの初期化中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  },
};