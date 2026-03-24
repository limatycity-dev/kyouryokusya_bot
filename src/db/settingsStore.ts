import { db } from "./client";

export async function getGuildSettings(guildId: string) {
  const result = await db.query(
    "SELECT ranking_channel_id FROM settings WHERE guild_id = $1",
    [guildId]
  );

  if ((result.rowCount ?? 0) === 0) return null;

  return {
    rankingChannelId: result.rows[0].ranking_channel_id,
  };
}