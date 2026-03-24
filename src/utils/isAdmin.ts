import { db } from "../db/client";

export async function isAdmin(userId: string, guildId: string): Promise<boolean> {
  const result = await db.query(
    `
    SELECT 1
    FROM admins
    WHERE user_id = $1
      AND guild_id = $2
    LIMIT 1
    `,
    [userId, guildId]
  );

  return (result.rowCount ?? 0) > 0;
}