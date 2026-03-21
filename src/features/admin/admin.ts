import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { db } from "../../db/client";

export const adminCommand = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("管理者を追加・削除します")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("ユーザーを管理者に追加する")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("追加するユーザー").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("ユーザーを管理者から削除する")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("削除するユーザー").setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser("user", true);

    // settings から category_id を取得
    const settingsRes = await db.query(
      "SELECT category_id FROM settings LIMIT 1"
    );
    const categoryId = settingsRes.rows[0].category_id;

    // 実行者が文明BOTの管理者か確認
    const adminCheck = await db.query(
      "SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2",
      [categoryId, interaction.user.id]
    );

    if (adminCheck.rowCount === 0) {
      return interaction.reply({
        content: "あなたは管理者ではありません。",
        ephemeral: true,
      });
    }

    // 管理者追加
    if (sub === "add") {
      await db.query(
        `INSERT INTO admins (category_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [categoryId, targetUser.id]
      );

      return interaction.reply({
        content: `${targetUser.username} さんを管理者に追加しました。`,
        ephemeral: true,
      });
    }

    // 管理者削除
    if (sub === "remove") {
      await db.query(
        "DELETE FROM admins WHERE category_id = $1 AND user_id = $2",
        [categoryId, targetUser.id]
      );

      return interaction.reply({
        content: `${targetUser.username} さんを管理者から削除しました。`,
        ephemeral: true,
      });
    }
  },
};