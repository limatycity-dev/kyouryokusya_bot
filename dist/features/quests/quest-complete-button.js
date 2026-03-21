"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestCompleteButton = handleQuestCompleteButton;
const discord_js_1 = require("discord.js");
const client_1 = require("../../db/client");
const getCategoryId_1 = require("../../utils/getCategoryId");
const updateRealtimeRanking_1 = require("../ranking/update/updateRealtimeRanking");
async function handleQuestCompleteButton(interaction) {
    try {
        const customId = interaction.customId;
        if (!customId.startsWith("quest_complete_"))
            return;
        const threadId = customId.replace("quest_complete_", "");
        const userId = interaction.user.id;
        const username = interaction.user.username; // ✅ 追加: username を取得
        // util でカテゴリID取得（スレッド → フォーラム → カテゴリ）
        const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
        if (!categoryId) {
            return interaction.reply({
                content: "カテゴリ内で実行してください。",
                ephemeral: true,
            });
        }
        // settings をカテゴリIDで取得（info_channel_id と ranking_channel_id 両方取得）
        const settingsRes = await client_1.db.query("SELECT info_channel_id, ranking_channel_id FROM settings WHERE category_id = $1", [categoryId]);
        if (settingsRes.rowCount === 0) {
            return interaction.reply({
                content: "このカテゴリは /setup が実行されていません。",
                ephemeral: true,
            });
        }
        const infoChannelId = settingsRes.rows[0].info_channel_id;
        const rankingChannelId = settingsRes.rows[0].ranking_channel_id;
        // クエスト取得
        const questRes = await client_1.db.query("SELECT id, type, points, title FROM quests WHERE forum_thread_id = $1", [threadId]);
        if (questRes.rowCount === 0) {
            return interaction.reply({
                content: "このクエスト情報が見つかりません。",
                ephemeral: true,
            });
        }
        const quest = questRes.rows[0];
        // 単発クエストは1回だけ
        const logCheck = await client_1.db.query("SELECT id FROM quest_logs WHERE quest_id = $1 AND user_id = $2", [quest.id, userId]);
        if ((logCheck.rowCount ?? 0) > 0 && quest.type === "single") {
            return interaction.reply({
                content: "このクエストはすでに達成済みです。",
                ephemeral: true,
            });
        }
        // 達成ログ追加
        await client_1.db.query("INSERT INTO quest_logs (user_id, quest_id, points) VALUES ($1,$2,$3)", [userId, quest.id, quest.points]);
        // ✅ 修正: name と weekly_points も保存、username を使用
        await client_1.db.query(`INSERT INTO users (user_id, name, total_points, weekly_points, weekly_tasks_completed)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (user_id)
       DO UPDATE SET
         name = COALESCE(NULLIF($2, ''), users.name),
         total_points = users.total_points + EXCLUDED.total_points,
         weekly_points = users.weekly_points + EXCLUDED.weekly_points,
         weekly_tasks_completed = users.weekly_tasks_completed + 1`, [userId, username, quest.points, quest.points]);
        // 累計ポイント取得
        const userPointRes = await client_1.db.query("SELECT total_points FROM users WHERE user_id = $1", [userId]);
        const totalPoints = userPointRes.rows[0].total_points;
        // ループクエストの累計回数
        const loopCountRes = await client_1.db.query("SELECT COUNT(*) FROM quest_logs WHERE quest_id = $1 AND user_id = $2", [quest.id, userId]);
        const loopCount = Number(loopCountRes.rows[0].count);
        // ✅ info_channel_id を使用してログチャンネルに送信
        const infoChannel = await interaction.guild?.channels.fetch(infoChannelId);
        if (infoChannel?.isTextBased()) {
            if (quest.type === "single") {
                await infoChannel.send(`${username} さんが「${quest.title}」を達成しました！（+${quest.points} pt）\n累計ポイント: ${totalPoints} pt`);
            }
            else {
                await infoChannel.send(`${username} さんが「${quest.title}」を達成しました！（+${quest.points} pt）\n累計 ${loopCount} 回目 / 累計ポイント: ${totalPoints} pt`);
            }
        }
        // 単発クエストならクローズ
        if (quest.type === "single") {
            await client_1.db.query("UPDATE quests SET status = 'closed' WHERE id = $1", [quest.id]);
            const thread = await interaction.guild?.channels.fetch(threadId);
            if (thread && thread.isThread()) {
                await thread.setName(`✅ ${thread.name}`);
                await thread.setLocked(true);
            }
        }
        // ✅ ランキングチャンネルを更新
        if (rankingChannelId) {
            const rankingChannel = await interaction.guild?.channels.fetch(rankingChannelId);
            if (rankingChannel instanceof discord_js_1.TextChannel) {
                const success = await (0, updateRealtimeRanking_1.updateRealtimeRanking)(rankingChannel);
                if (!success) {
                    console.warn("⚠️ ランキング更新に失敗しました");
                }
            }
        }
        return interaction.reply({
            content: `クエストを達成しました！ (+${quest.points} pt)`,
            ephemeral: true,
        });
    }
    catch (err) {
        console.error("QUEST COMPLETE ERROR:", err);
        return interaction.reply({
            content: "達成処理中にエラーが発生しました。",
            ephemeral: true,
        });
    }
}
