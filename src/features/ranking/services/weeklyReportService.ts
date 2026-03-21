// src/features/ranking/services/weeklyReportService.ts
import { db } from "../../../db/client";

export async function getWeeklyReport() {
  const result = await db.query(`
    SELECT
      name,
      weekly_points,
      weekly_tasks_created,
      weekly_tasks_completed
    FROM users
    ORDER BY weekly_points DESC;
  `);

  const rows = result.rows;

  return {
    ranks: rows.map((_, i) => String(i + 1)),
    names: rows.map(r => r.name),
    points: rows.map(r => r.weekly_points),
    created: rows.map(r => r.weekly_tasks_created),
    completed: rows.map(r => r.weekly_tasks_completed),
  };
}
