import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { db } from "../../db/client";
import { getCategoryId } from "../../utils/getCategoryId";

export const questCreateCommand = {
  data: new SlashCommandBuilder()
    .setName("quest-create")
    .setDescription("新しいクエストを作成します"),

  async execute(interaction: ChatInputCommandInteraction) {
    // カテゴリID取得（仕様書準拠）
    const categoryId = await getCategoryId(interaction.channel);
    if (!categoryId) {
      return interaction.reply({
        content: "このコマンドは文明カテゴリ内で実行してください。",
        ephemeral: true,
      });
    }

    // 管理者チェック（仕様書準拠）
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

    // モーダル作成（仕様書準拠：type を入力させる）
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

    const pointsInput = new TextInputBuilder()
      .setCustomId("points")
      .setLabel("ポイント")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const typeInput = new TextInputBuilder()
      .setCustomId("type")
      .setLabel("種類（空欄＝single / loop）")
      .setStyle(TextInputStyle.Short)
      .setRequired(false); // 空欄OK

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(pointsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput)
    );

    await interaction.showModal(modal);
  },
};