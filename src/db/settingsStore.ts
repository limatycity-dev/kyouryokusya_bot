import { db } from "./client";

export async function getSettingsByCategory(categoryId: string) {
  const result = await db.query(
    "SELECT ranking_channel_id FROM settings WHERE category_id = $1",
    [categoryId]
  );

  if ((result.rowCount ?? 0) === 0) return null;

  return {
    rankingChannelId: result.rows[0].ranking_channel_id,
  };
}