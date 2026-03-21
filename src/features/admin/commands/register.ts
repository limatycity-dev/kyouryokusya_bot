import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { db } from "../../../db/client";

export const registerCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("ユーザーを登録します")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const userId = interaction.user.id;
      const name = interaction.user.username;

      // ✅ 修正: user_id を使用
      const existing = await db.query(
        "SELECT * FROM users WHERE user_id = $1",
        [userId]
      );

      if (existing.rowCount > 0) {
        return interaction.reply({
          content: "すでに登録されています。",
          ephemeral: true,
        });
      }

      // ✅ 修正: user_id を使用
      await db.query(
        "INSERT INTO users (user_id, name) VALUES ($1, $2)",
        [userId, name]
      );

      return interaction.reply({
        content: `${name} さんを登録しました！`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      return interaction.reply({
        content: "登録中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  },
};