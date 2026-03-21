import { db } from "../../../db/client";
import { getWeeklyReport } from "../services/rankingService";
import { createWeeklyReportEmbed } from "../embeds/rankingEmbed";
import { TextChannel } from "discord.js";

export async function updateWeeklyRanking(channel: TextChannel): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT value FROM system WHERE key = 'weekly_report_message_id'`
    );

    const messageId = result.rows[0]?.value;

    if (!messageId) {
      console.warn("⚠️ weekly_report_message_id が見つかりません");
      return false;
    }

    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch (err) {
      console.error(
        "❌ 週間レポートメッセージが見つかりません (削除された可能性)",
        err
      );
      return false;
    }

    const report = await getWeeklyReport();
    const { embed, buttons } = createWeeklyReportEmbed(report);

    await message.edit({ embeds: [embed], components: [buttons] });
    console.log("✅ 週間レポート更新成功");
    return true;

  } catch (error) {
    console.error("❌ updateWeeklyRanking エラー:", error);
    return false;
  }
}