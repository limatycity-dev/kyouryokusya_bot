// src/features/ranking/embeds/rankingEmbed.ts
import { 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export interface RankingData {
  ranks: string[];
  names: string[];
  points: number[];
}

export function createRankingEmbed(data: RankingData) {
  const pointsFormatted = data.points.map(p => `${p.toLocaleString()} pt`);

  const embed = new EmbedBuilder()
    .setColor("#3498db")
    .setTitle("🏆 総合ポイントランキング（リアルタイム）")
    .setDescription("いつも協力ありがとうございます！")
    .addFields(
      { 
        name: "順位", 
        value: data.ranks.map(r => `**${r}位**`).join("\n") || "データなし", 
        inline: true 
      },
      { 
        name: "名前", 
        value: data.names.join("\n") || "データなし", 
        inline: true 
      },
      { 
        name: "ポイント", 
        value: pointsFormatted.join("\n") || "データなし", 
        inline: true 
      },
    )
    .setFooter({ text: "最終更新: " })
    .setTimestamp();

  // ✅ ボタン追加
  const buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("ranking_refresh")
        .setLabel("🔄 更新")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("ranking_weekly")
        .setLabel("📊 週間ランキング")
        .setStyle(ButtonStyle.Secondary)
    );

  return { embed, buttons };
}

export function createWeeklyReportEmbed(data: RankingData) {
  const pointsFormatted = data.points.map(p => `${p.toLocaleString()} pt`);

  const embed = new EmbedBuilder()
    .setColor("#f39c12")
    .setTitle("🌟 週間ランキング（今週のトップ貢献者）")
    .setDescription("この週の頑張り屋さんを表彲します！")
    .addFields(
      { 
        name: "順位", 
        value: data.ranks.map(r => `**${r}位**`).join("\n") || "データなし", 
        inline: true 
      },
      { 
        name: "名前", 
        value: data.names.join("\n") || "データなし", 
        inline: true 
      },
      { 
        name: "ポイント", 
        value: pointsFormatted.join("\n") || "データなし", 
        inline: true 
      },
    )
    .setFooter({ text: "最終更新: " })
    .setTimestamp();

  const buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("ranking_back")
        .setLabel("⬅️ 総合ランキング")
        .setStyle(ButtonStyle.Secondary)
    );

  return { embed, buttons };
}