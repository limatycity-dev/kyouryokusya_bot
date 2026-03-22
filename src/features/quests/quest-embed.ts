import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export interface QuestData {
  title: string;
  description?: string | null;
  points: number;
  type: string;
  questId: number;      // DB ID
  threadId: string;     // Discord thread ID
  issuerName?: string;  // 発行者名（仕様書準拠）
  status?: string;      // active / closed
}

export function createQuestEmbed(quest: QuestData) {
  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle(quest.title)
    .setDescription(quest.description ?? null) // ← 修正ポイント
    .addFields(
      { name: "ポイント", value: `${quest.points} pt`, inline: true },
      { name: "タイプ", value: quest.type === "single" ? "単発" : "ループ", inline: true },
      { name: "ステータス", value: quest.status === "closed" ? "終了" : "進行中", inline: true },
      ...(quest.issuerName
        ? [{ name: "発行者", value: quest.issuerName, inline: true }]
        : [])
    )
    .setTimestamp();

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`quest_complete_${quest.questId}`)
      .setLabel("✅ 達成する")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`quest_edit_${quest.questId}`)
      .setLabel("✏️ 編集")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`quest_close_${quest.questId}`)
      .setLabel("❌ 終了")
      .setStyle(ButtonStyle.Danger)
  );

  return { embed, buttons };
}