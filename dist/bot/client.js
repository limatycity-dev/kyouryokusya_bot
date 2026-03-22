"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
// 週次処理に必要なサービス
const rankingService_1 = require("../features/ranking/services/rankingService");
const weeklyReportService_1 = require("../features/ranking/services/weeklyReportService");
const settingRepository_1 = require("../features/ranking/repository/settingRepository");
dotenv_1.default.config();
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
exports.client.once("ready", async () => {
    console.log(`Logged in as ${exports.client.user?.tag}`);
    // ================================
    // 🕒 週次チェック（1時間ごと）
    // ================================
    setInterval(async () => {
        try {
            // 1. 週が変わったかどうか判定
            const changed = await rankingService_1.rankingService.ensureWeeklyResetIfNeeded();
            if (!changed)
                return;
            console.log("Weekly reset detected. Running weekly tasks...");
            // 2. 全カテゴリを取得（文明カテゴリが複数ある場合に対応）
            const categories = await (0, settingRepository_1.getAllCategories)();
            for (const c of categories) {
                const { category_id, ranking_channel_id } = c;
                // 3. 週間レポート投稿（履歴として残す）
                await weeklyReportService_1.weeklyReportService.postWeeklyReport(exports.client, category_id);
                // 4. ランキング（複合）更新（固定メッセージを上書き）
                await rankingService_1.rankingService.updateRankingCombined(exports.client, category_id, ranking_channel_id);
            }
            console.log("Weekly reset + report + ranking updated");
        }
        catch (err) {
            console.error("Weekly interval error:", err);
        }
    }, 1000 * 60 * 60); // 1時間ごと
});
exports.client.login(process.env.DISCORD_TOKEN);
