import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import dotenv from "dotenv";

// 週次処理に必要なサービス
import { rankingService } from "../features/ranking/services/rankingService";
import { weeklyReportService } from "../features/ranking/services/weeklyReportService";
import { getAllCategories } from "../features/ranking/repository/settingRepository";

// ★ 面接機能
import { GUIDELINE_CHANNEL_ID } from "../features/interview/config/constants";

dotenv.config();
console.log("GUIDELINE_CHANNEL_ID:", GUIDELINE_CHANNEL_ID);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {

/*
  // ================================
  // 📝 面接開始ボタン送信
  // ================================
  try {
    const channel = client.channels.cache.get(GUIDELINE_CHANNEL_ID) as TextChannel;

    if (channel) {
      const button = new ButtonBuilder()
        .setCustomId("interview_start")
        .setLabel("ギルド参加希望はこちら")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      await channel.send({
        content: "ギルド参加希望の方は、以下のボタンを押してください。",
        components: [row],
      });

      console.log("面接開始ボタンをガイドラインチャンネルに送信しました。");
    } else {
      console.error("ガイドラインチャンネルが見つかりません。");
    }
  } catch (err) {
    console.error("INTERVIEW BUTTON SEND ERROR:", err);
  }
*/

  // ================================
  // 🕒 週次チェック（1時間ごと）
  // ================================
  setInterval(async () => {
    try {
      const changed = await rankingService.ensureWeeklyResetIfNeeded();
      if (!changed) return;

      console.log("Weekly reset detected. Running weekly tasks...");

      const categories = await getAllCategories();

      for (const c of categories) {
        const { category_id, ranking_channel_id } = c;

        await weeklyReportService.postWeeklyReport(client, category_id);

        await rankingService.updateRankingCombined(
          client,
          category_id,
          ranking_channel_id
        );
      }

      console.log("Weekly reset + report + ranking updated");
    } catch (err) {
      console.error("Weekly interval error:", err);
    }
  }, 1000 * 60 * 60);
});

client.login(process.env.DISCORD_TOKEN);