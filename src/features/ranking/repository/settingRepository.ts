import { db } from "../../../db/client";

export async function getRankingChannelIdByCategoryId(categoryId: string): Promise<string> {
  const result = await db.query(
    `SELECT ranking_channel_id FROM settings WHERE category_id = $1`,
    [categoryId]
  );
  if (!result.rows[0]) throw new Error("Ranking channel not found");
  return result.rows[0].ranking_channel_id;
}