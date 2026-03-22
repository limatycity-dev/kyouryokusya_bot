"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestCompleteButton = handleQuestCompleteButton;
const client_1 = require("../../db/client");
const getCategoryId_1 = require("../../utils/getCategoryId");
const rankingService_1 = require("../ranking/services/rankingService");
const settingRepository_1 = require("../ranking/repository/settingRepository");
const quest_embed_1 = require("./quest-embed");
async function handleQuestCompleteButton(interaction) {
    try {
        const customId = interaction.customId;
        if (!customId.startsWith("quest_complete_"))
            return;
        // customId = quest_complete_<questId>
        const questId = customId.replace("quest_complete_", "");
        const userId = interaction.user.id;
        const username = interaction.user.username;
        // 1. カテゴリ判定
        const categoryId = (0, getCategoryId_1.getCategoryId)(interaction.channel);
        if (!categoryId) {
            return interaction.reply({
                content: "この操作は文明カテゴリ内でのみ実行できます。",
                ephemeral: true,
            });
        }
        // 2. settings 取得
        const settingsRes = await client_1.db.query("SELECT log_channel_id FROM settings WHERE category_id = $1", [categoryId]);
        if (settingsRes.rows.length === 0) {
            return interaction.reply({
                content: "このカテゴリは /setup が実行されていません。",
                ephemeral: true,
            });
        }
        const { log_channel_id } = settingsRes.rows[0];
        const ranking_channel_id = await (0, settingRepository_1.getRankingChannelIdByCategoryId)(categoryId);
        // 3. クエスト取得（message_id を含む）
        const questRes = await client_1.db.query("SELECT id, type, points, title, status, forum_thread_id, message_id FROM quests WHERE id = $1", [questId]);
        if (questRes.rows.length === 0) {
            return interaction.reply({
                content: "クエスト情報が見つかりません。",
                ephemeral: true,
            });
        }
        const quest = questRes.rows[0];
        const threadId = quest.forum_thread_id;
        if (quest.status === "closed") {
            return interaction.reply({
                content: "このクエストはすでに終了しています。",
                ephemeral: true,
            });
        }
        // 4. 単発クエストの二重達成チェック
        const logCheck = await client_1.db.query("SELECT id FROM quest_logs WHERE quest_id = $1 AND user_id = $2", [quest.id, userId]);
        if (logCheck.rows.length > 0 && quest.type === "single") {
            return interaction.reply({
                content: "このクエストはすでに達成済みです。",
                ephemeral: true,
            });
        }
        // 5. users（先に作る → 外部キー違反防止）
        await client_1.db.query(`
      INSERT INTO users (user_id, name, weekly_tasks_completed)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id)
      DO UPDATE SET
        name = COALESCE(NULLIF($2, ''), users.name),
        weekly_tasks_completed = users.weekly_tasks_completed + 1
      `, [userId, username]);
        // 6. quest_logs（後で追加）
        await client_1.db.query("INSERT INTO quest_logs (user_id, quest_id, points) VALUES ($1,$2,$3)", [userId, quest.id, quest.points]);
        // 7. user_stats 更新
        await client_1.db.query(`
      INSERT INTO user_stats (user_id, category_id, total_point, weekly_point, updated_at)
      VALUES ($1, $2, $3, $3, NOW())
      ON CONFLICT (user_id, category_id)
      DO UPDATE SET
        total_point = user_stats.total_point + EXCLUDED.total_point,
        weekly_point = user_stats.weekly_point + EXCLUDED.weekly_point,
        updated_at = NOW()
      `, [userId, categoryId, quest.points]);
        // 8. ログチャンネルへ送信
        const totalRes = await client_1.db.query("SELECT total_point FROM user_stats WHERE user_id = $1 AND category_id = $2", [userId, categoryId]);
        const totalPoints = totalRes.rows[0]?.total_point ?? 0;
        const loopCountRes = await client_1.db.query("SELECT COUNT(*) FROM quest_logs WHERE quest_id = $1 AND user_id = $2", [quest.id, userId]);
        const loopCount = Number(loopCountRes.rows[0].count);
        const logChannel = await interaction.guild?.channels.fetch(log_channel_id);
        if (logChannel?.isTextBased()) {
            if (quest.type === "single") {
                await logChannel.send(`🎉 ${username} さんが「${quest.title}」を達成しました！（+${quest.points} pt）\n累計ポイント: ${totalPoints} pt`);
            }
            else {
                await logChannel.send(`🎉 ${username} さんが「${quest.title}」を達成しました！（+${quest.points} pt）\n${loopCount} 回目の達成 / 累計ポイント: ${totalPoints} pt`);
            }
        }
        // 9. 単発クエストは終了処理（messageId を使って embed 更新）
        if (quest.type === "single") {
            await client_1.db.query("UPDATE quests SET status = 'closed' WHERE id = $1", [
                quest.id,
            ]);
            const thread = await interaction.guild?.channels.fetch(threadId);
            if (thread && thread.isThread()) {
                await thread.setName(`✅ ${quest.title}`);
                await thread.send(`🛑 このクエストは終了しました。`);
                await thread.setLocked(true);
                await thread.setArchived(true);
            }
            // embed 更新（messageId で直接 fetch）
            if (quest.message_id) {
                const thread = await interaction.guild?.channels.fetch(threadId);
                if (!thread || !thread.isThread()) {
                    return interaction.reply({
                        content: "スレッドが見つかりません。",
                        ephemeral: true,
                    });
                }
                const botMessage = await thread?.messages.fetch(quest.message_id);
                const { embed, buttons } = (0, quest_embed_1.createQuestEmbed)({
                    title: quest.title,
                    description: "", // description は変わらないので再取得不要
                    points: quest.points,
                    type: quest.type,
                    questId: quest.id,
                    threadId: quest.forum_thread_id,
                });
                await botMessage?.edit({ embeds: [embed], components: [buttons] });
            }
        }
        // 10. ランキング更新
        await rankingService_1.rankingService.updateRealtimeRanking(interaction.client, categoryId, ranking_channel_id);
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
