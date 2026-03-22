import { db } from "./client"; // ← これが正しい

export async function getGuildSettings(guildId: string) {
  const result = await db.query(
    "SELECT ranking_channel_id, realtime_message_id, weekly_message_id FROM settings WHERE guild_id = $1",
    [guildId]
  );

  if (result.rowCount === 0) return null;

  return {
    rankingChannelId: result.rows[0].ranking_channel_id,
    realtimeMessageId: result.rows[0].realtime_message_id,
    weeklyMessageId: result.rows[0].weekly_message_id,
  };
}