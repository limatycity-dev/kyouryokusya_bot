import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { db } from "../../../db/client";
import { getRealtimeRanking } from "../services/rankingService";
import { createRankingEmbed } from "../embeds/rankingEmbed";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("文明ポイントのリアルタイムランキングを更新します。");

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = interaction.channel;

  if (!channel || !(channel instanceof TextChannel)) {
    return interaction.reply("このコマンドはサーバー内のテキストチャンネルでのみ使用できます。");
  }

  const result = await db.query(
    `SELECT value FROM system WHERE key = 'ranking_message_id'`
  );

  const messageId = result.rows[0]?.value;

  if (!messageId) {
    return interaction.reply("❌ ランキングメッセージがまだ作成されていません。\n`/ranking-init` を実行してください。");
  }

  try {
    const message = await channel.messages.fetch(messageId);
    const ranking = await getRealtimeRanking();
    const { embed, buttons } = createRankingEmbed(ranking);

    await message.edit({ embeds: [embed], components: [buttons] });
    await interaction.reply("✅ ランキングを更新しました！");
  } catch (error) {
    console.error("❌ ランキング更新エラー:", error);
    return interaction.reply("❌ ランキングメッセージの更新に失敗しました。\n`/ranking-init` コマンドを実行してください。");
  }
}