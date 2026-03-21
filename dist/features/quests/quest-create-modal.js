"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestCreateModal = handleQuestCreateModal;
// quest-create-modal.ts
const discord_js_1 = require("discord.js");
const client_1 = require("../../db/client");
const quest_embed_1 = require("./quest-embed");
const getCategoryId_1 = require("../../utils/getCategoryId");
async function handleQuestCreateModal(interaction) {
    if (interaction.customId !== "quest_create_modal")
        return;
    try {
        const title = interaction.fields.getTextInputValue("title");
        const description = interaction.fields.getTextInputValue("description");
        const pointsRaw = interaction.fields.getTextInputValue("points");
        const points = Number(pointsRaw);
        if (isNaN(points)) {
            return interaction.reply({
                content: "ポイントは数値で入力してください。",
                ephemeral: true,
            });
        }
        let rawType = interaction.fields.getTextInputValue("type")?.trim().toLowerCase();
        const type = rawType === "loop" ? "loop" : "single";
        const issuerId = interaction.user.id;
        const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
        if (!categoryId) {
            return interaction.reply({
                content: "カテゴリ内で実行してください。",
                ephemeral: true,
            });
        }
        const settingsRes = await client_1.db.query("SELECT quest_board_channel_id FROM settings WHERE category_id = $1", [categoryId]);
        if (settingsRes.rowCount === 0) {
            return interaction.reply({
                content: "このカテゴリは /setup が実行されていません。",
                ephemeral: true,
            });
        }
        const { quest_board_channel_id } = settingsRes.rows[0];
        const forum = await interaction.guild?.channels.fetch(quest_board_channel_id);
        if (!forum || forum.type !== discord_js_1.ChannelType.GuildForum) {
            return interaction.reply({
                content: "クエスト掲示板フォーラムが見つかりません。",
                ephemeral: true,
            });
        }
        const thread = await forum.threads.create({
            name: title,
            message: { content: "クエストを作成しました！" },
        });
        // DB にクエスト保存（ID 取得用）
        const questRes = await client_1.db.query(`INSERT INTO quests (
        category_id, title, description, points, type, status, forum_thread_id, issuer_id
      ) VALUES ($1,$2,$3,$4,$5,'active',$6,$7)
      RETURNING id`, // ← ID を取得
        [categoryId, title, description, points, type, thread.id, issuerId]);
        const questId = questRes.rows[0].id;
        // ✅ ボタン付き Embed を送信
        const { embed, buttons } = (0, quest_embed_1.createQuestEmbed)({
            title,
            description,
            points,
            type,
            questId, // ← 追加
            threadId: thread.id // ← 追加
        });
        await thread.send({ embeds: [embed], components: [buttons] });
        return interaction.reply({
            content: `クエスト **${title}** を作成しました！`,
            ephemeral: true,
        });
    }
    catch (err) {
        console.error("QUEST CREATE MODAL ERROR:", err);
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({
                content: "クエスト作成中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    }
}
