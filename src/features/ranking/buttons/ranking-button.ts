import { ButtonInteraction, TextChannel } from "discord.js";
import { getRankingChannel } from "../utils/getRankingChannel";
import { updateRealtimeRanking } from "../update/updateRealtimeRanking";
import { updateWeeklyRanking } from "../update/updateWeeklyRanking";

export async function handleRankingButton(interaction: ButtonInteraction) {
  try {
    const customId = interaction.customId;

    // まず deferReply（仕様書で必須）
    await interaction.deferReply({ ephemeral: true });

    // ランキングチャンネルを設定から取得（仕様書準拠）
    const channel = await getRankingChannel(interaction.guildId);

    if (!channel || !(channel instanceof TextChannel)) {
      return interaction.editReply("❌ ランキングチャンネルが設定されていません。/setup で設定してください。");
    }

    // -------------------------
    // 1. リアルタイムランキング更新
    // -------------------------
    if (customId === "ranking_refresh") {
      const success = await updateRealtimeRanking(channel);

      if (success) {
        return interaction.editReply("✅ ランキングを更新しました！");
      } else {
        return interaction.editReply("❌ ランキング更新に失敗しました。");
      }
    }

    // -------------------------
    // 2. 週間ランキング表示（固定メッセージ更新）
    // -------------------------
    if (customId === "ranking_weekly") {
      const success = await updateWeeklyRanking(channel);

      if (success) {
        return interaction.editReply("📅 週間ランキングを更新しました！");
      } else {
        return interaction.editReply("❌ 週間ランキングの更新に失敗しました。");
      }
    }

    // -------------------------
    // 3. 総合ランキングに戻る
    // -------------------------
    if (customId === "ranking_back") {
      const success = await updateRealtimeRanking(channel);

      if (success) {
        return interaction.editReply("↩️ 総合ランキングに戻りました！");
      } else {
        return interaction.editReply("❌ ランキング更新に失敗しました。");
      }
    }

  } catch (error) {
    console.error("RANKING BUTTON ERROR:", error);
    return interaction.editReply("❌ ボタン処理中にエラーが発生しました。");
  }
}