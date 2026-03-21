import { ModalSubmitInteraction } from "discord.js";
import { db } from "../../db/client";
import { createQuestEmbed } from "./quest-embed";
import { getCategoryId } from "../../utils/getCategoryId";

export async function handleQuestEditModal(interaction: ModalSubmitInteraction) {
  if (!interaction.customId.startsWith("quest_edit_modal_")) return;

  const threadId = interaction.customId.replace("quest_edit_modal_", "");

  const newTitle = interaction.fields.getTextInputValue("title") || null;
  const newDesc = interaction.fields.getTextInputValue("description") || null;
  const newPoints = interaction.fields.getTextInputValue("points") || null;

  // util でカテゴリID取得（スレッド → フォーラム → カテゴリ）
  const categoryId = await getCategoryId(interaction.channel);

  if (!categoryId) {
    return interaction.reply({
      content: "カテゴリ内で実行してください。",
      ephemeral: true,
    });
  }

  // settings をカテゴリIDで取得
  const settingsRes = await db.query(
    "SELECT * FROM settings WHERE category_id = $1",
    [categoryId]
  );

  if (settingsRes.rowCount === 0) {
    return interaction.reply({
      content: "このカテゴリは /setup が実行されていません。",
      ephemeral: true,
    });
  }

  // 管理者判定
  const adminRes = await db.query(
    "SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2",
    [categoryId, interaction.user.id]
  );

  if (adminRes.rowCount === 0) {
    return interaction.reply({
      content: "あなたにはこのクエストを編集する権限がありません。",
      ephemeral: true,
    });
  }

  // クエスト取得
  const questRes = await db.query(
    "SELECT id FROM quests WHERE forum_thread_id = $1",
    [threadId]
  );

  if (questRes.rowCount === 0) {
    return interaction.reply({
      content: "クエスト情報が見つかりません。",
      ephemeral: true,
    });
  }

  const questId = questRes.rows[0].id;

  // DB 更新
  await db.query(
    `UPDATE quests
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         points = COALESCE($3, points)
     WHERE id = $4`,
    [newTitle, newDesc, newPoints ? Number(newPoints) : null, questId]
  );

  // スレッドの Embed を更新
  const thread = await interaction.guild?.channels.fetch(threadId);
  if (thread && thread.isThread()) {
    const messages = await thread.messages.fetch({ limit: 1 });
    const msg = messages.first();

    if (msg) {
      const updatedQuestRes = await db.query(
        "SELECT title, description, points, type, id, forum_thread_id FROM quests WHERE id = $1",
        [questId]
      );

      const updatedQuest = updatedQuestRes.rows[0];

      // ✅ 修正: { embed, buttons } を分割代入
      const { embed, buttons } = createQuestEmbed({
        title: updatedQuest.title,
        description: updatedQuest.description,
        points: updatedQuest.points,
        type: updatedQuest.type,
        questId: updatedQuest.id,
        threadId: updatedQuest.forum_thread_id,
      });

      // ✅ 修正: embed と buttons を使用
      await msg.edit({ embeds: [embed], components: [buttons] });
    }
  }

  return interaction.reply({
    content: "クエストを編集しました。",
    ephemeral: true,
  });
}