import { ButtonInteraction, TextChannel } from "discord.js";
import { db } from "../../db/client";
import { getCategoryId } from "../../utils/getCategoryId";
import { updateRealtimeRanking } from "../ranking/update/updateRealtimeRanking";

export async function handleQuestCompleteButton(interaction: ButtonInteraction) {
  try {
    const customId = interaction.customId;
    if (!customId.startsWith("quest_complete_")) return;

    const threadId = customId.replace("quest_complete_", "");
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // カテゴリID取得（仕様書準拠）
    const categoryId = getCategoryId(interaction.channel);
    if (!categoryId) {
      return interaction.reply({
        content: "このコマンドは文明カテゴリ内で実行してください。",
        ephemeral: true,
      });
    }

    // settings 取得（log_channel_id / ranking_channel_id）
    const settingsRes = await db.query(
      "SELECT log_channel_id, ranking_channel_id FROM settings WHERE category_id = $1",
      [categoryId]
    );

    if (settingsRes.rowCount === 0) {
      return interaction.reply({
        content: "このカテゴリは /setup が実行されていません。",
        ephemeral: true,
      });
    }

    const { log_channel_id, ranking_channel_id } = settingsRes.rows[0];

    // クエスト取得（status も取得）
    const questRes = await db.query(
      "SELECT id, type, points, title, status FROM quests WHERE forum_thread_id = $1",
      [threadId]
    );

    if (questRes.rowCount === 0) {
      return interaction.reply({
        content: "クエスト情報が見つかりません。",
        ephemeral: true,
      });
    }

    const quest = questRes.rows[0];

    // 終了済みクエストは達成不可
    if (quest.status === "closed") {
      return interaction.reply({
        content: "このクエストはすでに終了しています。",
        ephemeral: true,
      });
    }

    // 単発クエストは1回だけ
    const logCheck = await db.query(
      "SELECT id FROM quest_logs WHERE quest_id = $1 AND user_id = $2",
      [quest.id, userId]
    );

    if ((logCheck.rowCount ?? 0) > 0 && quest.type === "single") {
      return interaction.reply({
        content: "このクエストはすでに達成済みです。",
        ephemeral: true,
      });
    }

    // 達成ログ追加
    await db.query(
      "INSERT INTO quest_logs (user_id, quest_id, points) VALUES ($1,$2,$3)",
      [userId, quest.id, quest.points]
    );

    // users テーブル更新（category_id 必須）
    await db.query(
      `INSERT INTO users (category_id, user_id, name, total_points, weekly_points, weekly_tasks_completed)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT (category_id, user_id)
       DO UPDATE SET
         name = COALESCE(NULLIF($3, ''), users.name),
         total_points = users.total_points + EXCLUDED.total_points,
         weekly_points = users.weekly_points + EXCLUDED.weekly_points,
         weekly_tasks_completed = users.weekly_tasks_completed + 1`,
      [categoryId, userId, username, quest.points, quest.points]
    );

    // 累計ポイント取得
    const userPointRes = await db.query(
      "SELECT total_points FROM users WHERE category_id = $1 AND user_id = $2",
      [categoryId, userId]
    );
    const totalPoints = userPointRes.rows[0].total_points;

    // ループクエストの累計回数
    const loopCountRes = await db.query(
      "SELECT COUNT(*) FROM quest_logs WHERE quest_id = $1 AND user_id = $2",
      [quest.id, userId]
    );
    const loopCount = Number(loopCountRes.rows[0].count);

    // ログチャンネルに送信（仕様書準拠）
    const logChannel = await interaction.guild?.channels.fetch(log_channel_id);
    if (logChannel?.isTextBased()) {
      if (quest.type === "single") {
        await logChannel.send(
          `🎉 ${username} さんが「${quest.title}」を達成しました！（+${quest.points} pt）\n累計ポイント: ${totalPoints} pt`
        );
      } else {
        await logChannel.send(
          `🎉 ${username} さんが「${quest.title}」を達成しました！（+${quest.points} pt）\n${loopCount} 回目の達成 / 累計ポイント: ${totalPoints} pt`
        );
      }
    }

    // 単発クエストは達成後に終了（仕様書準拠）
    if (quest.type === "single") {
      await db.query(
        "UPDATE quests SET status = 'closed' WHERE id = $1",
        [quest.id]
      );

      const thread = await interaction.guild?.channels.fetch(threadId);
      if (thread && thread.isThread()) {
        // スレッド名を仕様書準拠に変更
        await thread.setName(`✅ ${quest.title}`);

        // 終了メッセージ
        await thread.send(`🛑 このクエストは終了しました。`);

        // ロック＋アーカイブ
        await thread.setLocked(true);
        await thread.setArchived(true);
      }
    }

    // ランキング更新
    if (ranking_channel_id) {
      const rankingChannel = await interaction.guild?.channels.fetch(ranking_channel_id);
      if (rankingChannel instanceof TextChannel) {
        const success = await updateRealtimeRanking(rankingChannel);
        if (!success) console.warn("⚠️ ランキング更新に失敗しました");
      }
    }

    return interaction.reply({
      content: `クエストを達成しました！ (+${quest.points} pt)`,
      ephemeral: true,
    });
  } catch (err) {
    console.error("QUEST COMPLETE ERROR:", err);
    return interaction.reply({
      content: "達成処理中にエラーが発生しました。",
      ephemeral: true,
    });
  }
}