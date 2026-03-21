import { ModalSubmitInteraction } from "discord.js";
import { db } from "../../db/client";
import { createQuestEmbed } from "./quest-embed";
import { getCategoryId } from "../../utils/getCategoryId";

export async function handleQuestEditModal(interaction: ModalSubmitInteraction) {
  if (!interaction.customId.startsWith("quest_edit_modal_")) return;

  // customId は questId
  const questId = interaction.customId.replace("quest_edit_modal_", "");

  const newTitle = interaction.fields.getTextInputValue("title") || null;
  const newDesc = interaction.fields.getTextInputValue("description") || null;
  const newPointsRaw = interaction.fields.getTextInputValue("points") || null;

  // ポイントバリデーション
  let newPoints: number | null = null;
  if (newPointsRaw) {
    const num = Number(newPointsRaw);
    if (isNaN(num) || num <= 0 || num > 9999) {
      return interaction.reply({
        content: "ポイントは 1〜9999 の数値で入力してください。",
        ephemeral: true,
      });
    }
    newPoints = num;
  }

  // カテゴリID取得（仕様書準拠）
  const categoryId = getCategoryId(interaction.channel);
  if (!categoryId) {
    return interaction.reply({
      content: "このコマンドは文明カテゴリ内で実行してください。",
      ephemeral: true,
    });
  }

  // settings 取得（log_channel_id 必須）
  const settingsRes = await db.query(
    "SELECT log_channel_id FROM settings WHERE category_id = $1",
    [categoryId]
  );

  if (settingsRes.rowCount === 0) {
    return interaction.reply({
      content: "このカテゴリは /setup が実行されていません。",
      ephemeral: true,
    });
  }

  const { log_channel_id } = settingsRes.rows[0];

  // 管理者チェック
  const adminRes = await db.query(
    "SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2",
    [categoryId, interaction.user.id]
  );

  if (adminRes.rowCount === 0) {
    return interaction.reply({
      content: "あなたはこの文明の管理者ではありません。",
      ephemeral: true,
    });
  }

  // クエスト取得（questId ベース）
  const questRes = await db.query(
    "SELECT id, title, description, points, type, status, forum_thread_id FROM quests WHERE id = $1",
    [questId]
  );

  if (questRes.rowCount === 0) {
    return interaction.reply({
      content: "クエスト情報が見つかりません。",
      ephemeral: true,
    });
  }

  const quest = questRes.rows[0];

  // DB 更新
  await db.query(
    `UPDATE quests
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         points = COALESCE($3, points)
     WHERE id = $4`,
    [newTitle, newDesc, newPoints, questId]
  );

  // スレッド取得
  const thread = await interaction.guild?.channels.fetch(quest.forum_thread_id);
  if (thread && thread.isThread()) {
    // スレッド名更新（仕様書準拠）
    const updatedTitle = newTitle ?? quest.title;
    const newThreadName =
      quest.status === "closed"
        ? `✅ ${updatedTitle}`
        : updatedTitle;

    await thread.setName(newThreadName);

    // 最初のメッセージ（embed）を更新
    const messages = await thread.messages.fetch({ limit: 1 });
    const msg = messages.first();

    if (msg) {
      const updatedQuestRes = await db.query(
        "SELECT title, description, points, type, id, forum_thread_id FROM quests WHERE id = $1",
        [questId]
      );

      const updatedQuest = updatedQuestRes.rows[0];

      const { embed, buttons } = createQuestEmbed({
        title: updatedQuest.title,
        description: updatedQuest.description,
        points: updatedQuest.points,
        type: updatedQuest.type,
        questId: updatedQuest.id,
        threadId: updatedQuest.forum_thread_id,
      });

      await msg.edit({ embeds: [embed], components: [buttons] });
    }
  }

  // ログ送信（仕様書準拠）
  const logChannel = await interaction.guild?.channels.fetch(log_channel_id);
  if (logChannel?.isTextBased()) {
    await logChannel.send(
      `✏️ 管理者 ${interaction.user.username} さんがクエスト「${newTitle ?? quest.title}」を編集しました。`
    );
  }

  return interaction.reply({
    content: "クエストを編集しました。",
    ephemeral: true,
  });
}