import { db } from "../db/client";

export async function isAdmin(userId: string, categoryId: string): Promise<boolean> {
  const result = await db.query(
    `
    SELECT 1
    FROM admins
    WHERE user_id = $1
      AND category_id = $2
    LIMIT 1
    `,
    [userId, categoryId]
  );

  return (result.rowCount ?? 0) > 0;
}