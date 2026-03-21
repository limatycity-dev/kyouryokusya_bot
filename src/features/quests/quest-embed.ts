import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from "discord.js";

export interface QuestData {
  title: string;
  description: string;
  points: number;
  type: string;
  questId: number;          // ← DB ID
  threadId: string;         // ← Discord スレッド ID
}

export function createQuestEmbed(quest: QuestData) {
  const embed = new EmbedBuilder()
    .setColor("#00AEEF")
    .setTitle(quest.title)
    .setDescription(quest.description)
    .addFields(
      { name: "ポイント", value: `${quest.points} pt`, inline: true },
      { name: "タイプ", value: quest.type === "single" ? "単発" : "ループ", inline: true }
    )
    .setTimestamp();

  const buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`quest_complete_${quest.threadId}`)  // ← threadId 使用
        .setLabel("✅ 達成する")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`quest_edit_modal_${quest.threadId}`)  // ← threadId 使用
        .setLabel("✏️ 編集")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`quest_close_${quest.threadId}`)  // ✅ 修正: threadId 使用
        .setLabel("❌ 削除")
        .setStyle(ButtonStyle.Danger)
    );

  return { embed, buttons };
}