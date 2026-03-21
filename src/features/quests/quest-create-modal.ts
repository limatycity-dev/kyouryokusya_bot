import { ModalSubmitInteraction, ChannelType } from "discord.js";
import { db } from "../../db/client";
import { createQuestEmbed } from "./quest-embed";
import { getCategoryId } from "../../utils/getCategoryId";

export async function handleQuestCreateModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId !== "quest_create_modal") return;

  try {
    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");

    // ポイント
    const pointsRaw = interaction.fields.getTextInputValue("points");
    const points = Number(pointsRaw);

    if (isNaN(points)) {
      return interaction.reply({
        content: "ポイントは数値で入力してください。",
        ephemeral: true,
      });
    }

    if (points <= 0) {
      return interaction.reply({
        content: "ポイントは 1 以上の数値を入力してください。",
        ephemeral: true,
      });
    }

    if (points > 9999) {
      return interaction.reply({
        content: "ポイントは 9999 以下で入力してください。",
        ephemeral: true,
      });
    }

    // type（仕様書準拠：single / loop）
    const rawType = interaction.fields.getTextInputValue("type")?.trim().toLowerCase();
    const type = rawType === "loop" ? "loop" : "single";

    const issuerId = interaction.user.id;

    // カテゴリID取得（仕様書準拠）
    const categoryId = getCategoryId(interaction.channel);
    if (!categoryId) {
      return interaction.reply({
        content: "このコマンドは文明カテゴリ内で実行してください。",
        ephemeral: true,
      });
    }

    // settings 取得（クエスト掲示板 + ログチャンネル）
    const settingsRes = await db.query(
      "SELECT quest_board_channel_id, log_channel_id FROM settings WHERE category_id = $1",
      [categoryId]
    );

    if (settingsRes.rowCount === 0) {
      return interaction.reply({
        content: "このカテゴリは /setup が実行されていません。",
        ephemeral: true,
      });
    }

    const { quest_board_channel_id, log_channel_id } = settingsRes.rows[0];

    // クエスト掲示板フォーラム取得
    const forum = await interaction.guild?.channels.fetch(quest_board_channel_id);

    if (!forum || forum.type !== ChannelType.GuildForum) {
      return interaction.reply({
        content: "クエスト掲示板フォーラムが見つかりません。",
        ephemeral: true,
      });
    }

    // スレッド作成（仕様書準拠）
    const thread = await forum.threads.create({
      name: title,
      message: { content: "📝 クエストが作成されました！" },
    });

    // DB にクエスト保存
    const questRes = await db.query(
      `INSERT INTO quests (
        category_id, title, description, points, type, status, forum_thread_id, issuer_id
      ) VALUES ($1,$2,$3,$4,$5,'active',$6,$7)
      RETURNING id`,
      [categoryId, title, description, points, type, thread.id, issuerId]
    );

    const questId = questRes.rows[0].id;

    // embed + ボタン（仕様書準拠）
    const { embed, buttons } = createQuestEmbed({
      title,
      description,
      points,
      type,
      questId,
      threadId: thread.id,
    });

    await thread.send({ embeds: [embed], components: [buttons] });

    // ログチャンネルに通知（仕様書準拠）
    const logChannel = await interaction.guild?.channels.fetch(log_channel_id);
    if (logChannel?.isTextBased()) {
      await logChannel.send(
        `🆕 ${interaction.user.username} さんが新しいクエスト「${title}」を作成しました！`
      );
    }

    return interaction.reply({
      content: `クエスト **${title}** を作成しました！`,
      ephemeral: true,
    });

  } catch (err) {
    console.error("QUEST CREATE MODAL ERROR:", err);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "クエスト作成中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  }
}