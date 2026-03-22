"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestCloseButton = handleQuestCloseButton;
const client_1 = require("../../db/client");
const getCategoryId_1 = require("../../utils/getCategoryId");
const quest_embed_1 = require("./quest-embed");
async function handleQuestCloseButton(interaction) {
    try {
        const customId = interaction.customId;
        if (!customId.startsWith("quest_close_"))
            return;
        const questId = customId.replace("quest_close_", "");
        const userId = interaction.user.id;
        // スレッド内で押されているかチェック
        if (!interaction.channel?.isThread()) {
            return interaction.reply({
                content: "終了操作はクエストスレッド内のボタンから実行してください。",
                ephemeral: true,
            });
        }
        // カテゴリID取得
        const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
        if (!categoryId) {
            return interaction.reply({
                content: "この操作は文明カテゴリ内でのみ実行できます。",
                ephemeral: true,
            });
        }
        // settings 取得
        const settingsRes = await client_1.db.query("SELECT log_channel_id FROM settings WHERE category_id = $1", [categoryId]);
        if (settingsRes.rowCount === 0) {
            return interaction.reply({
                content: "このカテゴリは /setup が実行されていません。",
                ephemeral: true,
            });
        }
        const { log_channel_id } = settingsRes.rows[0];
        // 管理者判定
        const adminRes = await client_1.db.query("SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2", [categoryId, userId]);
        if (adminRes.rowCount === 0) {
            return interaction.reply({
                content: "あなたはこの文明の管理者ではありません。",
                ephemeral: true,
            });
        }
        // クエスト取得
        const questRes = await client_1.db.query("SELECT id, title, status, forum_thread_id, message_id, description, points, type FROM quests WHERE id = $1", [questId]);
        if (questRes.rowCount === 0) {
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
        // クエストを終了状態に更新
        await client_1.db.query("UPDATE quests SET status = 'closed' WHERE id = $1", [
            quest.id,
        ]);
        // ================================
        // ★ 1. まず interaction.reply()（アーカイブ前に必ずやる）
        // ================================
        await interaction.reply({
            content: `クエスト「${quest.title}」を終了しました。`,
            ephemeral: true,
        });
        // スレッド取得
        const thread = await interaction.guild?.channels.fetch(threadId);
        if (thread && thread.isThread()) {
            // 2. embed 更新
            if (quest.message_id) {
                const botMessage = await thread.messages.fetch(quest.message_id);
                const { embed, buttons } = (0, quest_embed_1.createQuestEmbed)({
                    title: quest.title,
                    description: quest.description,
                    points: quest.points,
                    type: quest.type,
                    questId: quest.id,
                    threadId: quest.forum_thread_id,
                    status: "closed",
                });
                await botMessage.edit({ embeds: [embed], components: [buttons] });
            }
            // 3. 終了メッセージ
            await thread.send(`🛑 このクエストは終了しました。`);
            // 4. スレッド名変更
            await thread.setName(`✅ ${quest.title}`);
            // 5. ロック
            await thread.setLocked(true);
            // 6. アーカイブ（最後）
            await thread.setArchived(true);
        }
        // ログチャンネルに通知
        const logChannel = await interaction.guild?.channels.fetch(log_channel_id);
        if (logChannel?.isTextBased()) {
            await logChannel.send(`🛑 管理者 ${interaction.user.username} さんが「${quest.title}」を終了しました。`);
        }
    }
    catch (err) {
        console.error("QUEST CLOSE ERROR:", err);
        return interaction.reply({
            content: "終了処理中にエラーが発生しました。",
            ephemeral: true,
        });
    }
}
