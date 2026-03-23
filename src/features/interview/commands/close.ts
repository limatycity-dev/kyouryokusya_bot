import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildChannel,
  SlashCommandBuilder,
} from "discord.js";
import { INTERVIEW_ARCHIVE_CATEGORY_ID } from "../config/constants";
import { validateInterviewChannel } from "../utils/validateInterviewChannel";

export const interviewCloseCommand = {
  data: new SlashCommandBuilder()
    .setName("interview-close")
    .setDescription("面接チャンネルをアーカイブへ移動します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const channel = interaction.channel;

      if (!channel || !interaction.guild) {
        return interaction.reply({
          content: "サーバー内でのみ使用できます。",
          ephemeral: true,
        });
      }

      // 管理者権限チェック
      if (
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.Administrator
        )
      ) {
        return interaction.reply({
          content: "このコマンドを実行する権限がありません。",
          ephemeral: true,
        });
      }

      // GuildChannel にキャスト
      const guildChannel = channel as GuildChannel;

      // 面接カテゴリ判定
      if (!validateInterviewChannel(guildChannel)) {
        return interaction.reply({
          content: "このチャンネルは面接チャンネルではありません。",
          ephemeral: true,
        });
      }

      // アーカイブカテゴリへ移動
      await guildChannel.setParent(INTERVIEW_ARCHIVE_CATEGORY_ID);

      return interaction.reply({
        content: "面接を終了し、チャンネルをアーカイブへ移動しました。",
        ephemeral: true,
      });
    } catch (error) {
      console.error("INTERVIEW CLOSE ERROR:", error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "面接終了処理中にエラーが発生しました。",
          ephemeral: true,
        });
      }
    }
  },
};