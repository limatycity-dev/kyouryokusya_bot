import { ButtonInteraction, TextChannel } from "discord.js";
import { db } from "../../db/client";
import { getCategoryId } from "../../utils/getCategoryId";

export async function handleQuestCloseButton(interaction: ButtonInteraction) {
  try {
    const customId = interaction.customId;

    if (!customId.startsWith("quest_close_")) return;

    const threadId = customId.replace("quest_close_", "");
    const userId = interaction.user.id;

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
      "SELECT info_channel_id FROM settings WHERE category_id = $1",  // ✅ 修正: info_channel_id を使用
      [categoryId]
    );

    if (settingsRes.rowCount === 0) {
      return interaction.reply({
        content: "このカテゴリは /setup が実行されていません。",
        ephemeral: true,
      });
    }

    const { info_channel_id } = settingsRes.rows[0];  // ✅ 修正: info_channel_id

    // 管理者判定
    const adminRes = await db.query(
      "SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2",
      [categoryId, userId]
    );

    if (adminRes.rowCount === 0) {
      return interaction.reply({
        content: "あなたにはこのクエストを削除する権限がありません。",
        ephemeral: true,
      });
    }

    // クエスト取得
    const questRes = await db.query(
      "SELECT id, title FROM quests WHERE forum_thread_id = $1",
      [threadId]
    );

    if (questRes.rowCount === 0) {
      return interaction.reply({
        content: "クエスト情報が見つかりません。",
        ephemeral: true,
      });
    }

    const quest = questRes.rows[0];

    // クエスト削除
    await db.query("DELETE FROM quests WHERE id = $1", [quest.id]);

    // ログチャンネルに通知
    const infoChannel = await interaction.guild?.channels.fetch(info_channel_id);
    if (infoChannel?.isTextBased()) {
      await infoChannel.send(
        `${interaction.user.username} さんがクエスト「${quest.title}」を削除しました。`
      );
    }

    // スレッド削除
    const thread = await interaction.guild?.channels.fetch(threadId);
    if (thread && thread.isThread()) {
      await thread.delete();
    }

    return interaction.reply({
      content: `クエスト「${quest.title}」を削除しました。`,
      ephemeral: true,
    });
  } catch (err) {
    console.error("QUEST CLOSE ERROR:", err);
    return interaction.reply({
      content: "削除処理中にエラーが発生しました。",
      ephemeral: true,
    });
  }
}