import { ButtonInteraction, TextChannel } from "discord.js";
import { updateRealtimeRanking } from "../update/updateRealtimeRanking";
import { updateWeeklyRanking } from "../update/updateWeeklyRanking";

export async function handleRankingButton(interaction: ButtonInteraction) {
  try {
    // 更新ボタン
    if (interaction.customId === "ranking_refresh") {
      const channel = interaction.channel;

      if (!channel || !(channel instanceof TextChannel)) {
        return interaction.reply({
          content: "このコマンドはテキストチャンネルでのみ使用できます。",
          ephemeral: true,
        });
      }

      const success = await updateRealtimeRanking(channel);

      if (success) {
        return interaction.reply({
          content: "✅ ランキングを更新しました！",
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content: "❌ ランキング更新に失敗しました。",
          ephemeral: true,
        });
      }
    }

    // 週間ランキングボタン
    if (interaction.customId === "ranking_weekly") {
      const channel = interaction.channel;

      if (!channel || !(channel instanceof TextChannel)) {
        return interaction.reply({
          content: "このコマンドはテキストチャンネルでのみ使用できます。",
          ephemeral: true,
        });
      }

      const success = await updateWeeklyRanking(channel);

      if (success) {
        return interaction.reply({
          content: "✅ 週間ランキングを表示しました！",
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content: "❌ 週間ランキング表示に失敗しました。",
          ephemeral: true,
        });
      }
    }

    // 総合ランキングに戻るボタン
    if (interaction.customId === "ranking_back") {
      const channel = interaction.channel;

      if (!channel || !(channel instanceof TextChannel)) {
        return interaction.reply({
          content: "このコマンドはテキストチャンネルでのみ使用できます。",
          ephemeral: true,
        });
      }

      const success = await updateRealtimeRanking(channel);

      if (success) {
        return interaction.reply({
          content: "✅ 総合ランキングに戻りました！",
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content: "❌ ランキング更新に失敗しました。",
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error("RANKING BUTTON ERROR:", error);
    return interaction.reply({
      content: "ボタン処理中にエラーが発生しました。",
      ephemeral: true,
    });
  }
}