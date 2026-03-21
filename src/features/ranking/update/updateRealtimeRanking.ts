// src/features/ranking/update/updateRealtimeRanking.ts
import { db } from "../../../db/client";
import { getRealtimeRanking } from "../services/rankingService";
import { createRankingEmbed } from "../embeds/rankingEmbed";
import { TextChannel } from "discord.js";

export async function updateRealtimeRanking(channel: TextChannel): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT value FROM system WHERE key = 'ranking_message_id'`
    );

    const messageId = result.rows[0]?.value;

    if (!messageId) {
      console.warn("⚠️ ranking_message_id が見つかりません");
      return false;
    }

    // メッセージ取得時のエラーハンドル
    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch (err) {
      console.error(
        "❌ ランキングメッセージが見つかりません (削除された可能性)",
        err
      );
      return false;
    }

    const ranking = await getRealtimeRanking();
    // ✅ 修正: ボタン付き Embed を取得
    const { embed, buttons } = createRankingEmbed(ranking);

    // ✅ 修正: components を追加
    await message.edit({ embeds: [embed], components: [buttons] });
    console.log("✅ ランキング更新成功");
    return true;

  } catch (error) {
    console.error("❌ updateRealtimeRanking エラー:", error);
    return false;
  }
}
