import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { db } from "../../db/client";
import { getCategoryId } from "../../utils/getCategoryId";

export async function handleQuestEditButton(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith("quest_edit_")) return;

  // customId = quest_edit_<questId>
  const questId = interaction.customId.replace("quest_edit_", "");

  // カテゴリID取得（仕様書準拠）
  const categoryId = await getCategoryId(interaction.channel);
  if (!categoryId) {
    return interaction.reply({
      content: "この操作は文明カテゴリ内でのみ実行できます。",
      ephemeral: true,
    });
  }

  // 管理者チェック
  const adminCheck = await db.query(
    "SELECT 1 FROM admins WHERE category_id = $1 AND user_id = $2",
    [categoryId, interaction.user.id]
  );

  if (adminCheck.rowCount === 0) {
    return interaction.reply({
      content: "あなたはこの文明の管理者ではありません。",
      ephemeral: true,
    });
  }

  // クエスト取得（questId で検索）
  const questRes = await db.query(
    "SELECT id, title, description, points FROM quests WHERE id = $1",
    [questId]
  );

  if (questRes.rowCount === 0) {
    return interaction.reply({
      content: "クエスト情報が見つかりません。",
      ephemeral: true,
    });
  }

  const quest = questRes.rows[0];

  // モーダル作成（仕様書準拠）
  const modal = new ModalBuilder()
    .setCustomId(`quest_edit_modal_${quest.id}`) // questId を使用
    .setTitle("クエストを編集");

  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setLabel("タイトル")
    .setStyle(TextInputStyle.Short)
    .setValue(quest.title)
    .setRequired(false);

  const descInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel("説明")
    .setStyle(TextInputStyle.Paragraph)
    .setValue(quest.description ?? "")
    .setRequired(false);

  const pointsInput = new TextInputBuilder()
    .setCustomId("points")
    .setLabel("ポイント（数字）")
    .setStyle(TextInputStyle.Short)
    .setValue(String(quest.points))
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(pointsInput)
  );

  await interaction.showModal(modal);
}