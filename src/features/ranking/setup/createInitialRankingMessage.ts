// src/features/ranking/setup/createInitialRankingMessage.ts
import { TextChannel } from "discord.js";
import { db } from "../../../db/client";
import { getRealtimeRanking } from "../services/rankingService";
import { createRankingEmbed } from "../embeds/rankingEmbed";

export async function createInitialRankingMessage(channel: TextChannel) {
  const ranking = await getRealtimeRanking();
  const { embed, buttons } = createRankingEmbed(ranking);

  const message = await channel.send({ embeds: [embed], components: [buttons] });

  await db.query(
    `INSERT INTO system (key, value) VALUES ('ranking_message_id', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [message.id]
  );

  console.log("✅ ランキングメッセージ作成成功");
}