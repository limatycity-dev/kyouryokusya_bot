// quest-create.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export const questCreateCommand = {
  data: new SlashCommandBuilder()
    .setName("quest-create")
    .setDescription("新しいクエストを作成します"),

  async execute(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("quest_create_modal")
      .setTitle("クエストを作成");

    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("クエスト名")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descInput = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("説明")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const typeInput = new TextInputBuilder()
      .setCustomId("type")
      .setLabel("種類（空欄＝単発 / loop＝ループ）")
      .setStyle(TextInputStyle.Short)
      .setRequired(false); // ← ここが重要！

    const pointsInput = new TextInputBuilder()
      .setCustomId("points")
      .setLabel("ポイント")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(pointsInput)
    );

    await interaction.showModal(modal);
  },
};