import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export async function handleQuestEditButton(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith("quest_edit_")) return;

  const threadId = interaction.customId.replace("quest_edit_", "");

  // モーダル作成
  const modal = new ModalBuilder()
    .setCustomId(`quest_edit_modal_${threadId}`)
    .setTitle("クエスト編集");

  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setLabel("タイトル")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const descInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel("説明")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  const pointsInput = new TextInputBuilder()
    .setCustomId("points")
    .setLabel("ポイント（数字）")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(pointsInput)
  );

  await interaction.showModal(modal);
}