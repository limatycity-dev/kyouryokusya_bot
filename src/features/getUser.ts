import { db } from "../db/client";
import type { User } from "../types/user";

export async function getUser(discordUserId: string): Promise<User | null> {
  const result = await db.query(
    "SELECT * FROM users WHERE user_id = $1",
    [discordUserId]
  );
  return result.rows[0] ?? null;
}