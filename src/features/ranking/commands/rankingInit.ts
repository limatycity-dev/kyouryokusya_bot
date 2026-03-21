// src/features/ranking/commands/rankingInit.ts
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { db } from "../../../db/client";
import { createInitialRankingMessage } from "../setup/createInitialRankingMessage";

export const data = new SlashCommandBuilder()
  .setName("ranking-init")
  .setDescription("ランキングメッセージを初期化します。");

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = interaction.channel;

  if (!channel || !(channel instanceof TextChannel)) {
    return interaction.reply("このコマンドはサーバー内のテキストチャンネルでのみ使用できます。");
  }

  const result = await db.query(
    `SELECT value FROM system WHERE key = 'ranking_message_id'`
  );

  if (result.rowCount > 0) {
    return interaction.reply("ランキングメッセージはすでに作成されています。");
  }

  try {
    await createInitialRankingMessage(channel);
    await interaction.reply("ランキングメッセージを作成しました！");
  } catch (error) {
    console.error("RANKING INIT ERROR:", error);
    return interaction.reply("ランキングメッセージの作成に失敗しました。");
  }
}
