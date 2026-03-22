import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

// 週次処理に必要なサービス
import { rankingService } from "../features/ranking/services/rankingService";
import { weeklyReportService } from "../features/ranking/services/weeklyReportService";
import { getAllCategories } from "../features/ranking/repository/settingRepository";

dotenv.config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  // ================================
  // 🕒 週次チェック（1時間ごと）
  // ================================
  setInterval(async () => {
    try {
      // 1. 週が変わったかどうか判定
      const changed = await rankingService.ensureWeeklyResetIfNeeded();
      if (!changed) return;

      console.log("Weekly reset detected. Running weekly tasks...");

      // 2. 全カテゴリを取得（文明カテゴリが複数ある場合に対応）
      const categories = await getAllCategories();

      for (const c of categories) {
        const { category_id, ranking_channel_id } = c;

        // 3. 週間レポート投稿（履歴として残す）
        await weeklyReportService.postWeeklyReport(client, category_id);

        // 4. ランキング（複合）更新（固定メッセージを上書き）
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
  }, 1000 * 60 * 60); // 1時間ごと
});

client.login(process.env.DISCORD_TOKEN);