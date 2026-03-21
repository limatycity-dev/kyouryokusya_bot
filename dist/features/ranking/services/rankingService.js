"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtimeRanking = getRealtimeRanking;
exports.getWeeklyReport = getWeeklyReport;
// src/features/ranking/services/rankingService.ts
const client_1 = require("../../../db/client");
async function getRealtimeRanking() {
    const result = await client_1.db.query(`
    SELECT name, total_points
    FROM users
    ORDER BY total_points DESC
    LIMIT 10;
  `);
    const rows = result.rows;
    // ✅ 修正: ユーザーが1人も登録されていない場合を対応
    if (rows.length === 0) {
        return {
            ranks: ["1"],
            names: ["（まだ誰も達成していません）"],
            points: [0],
        };
    }
    return {
        ranks: rows.map((_, i) => String(i + 1)),
        names: rows.map(r => r.name || "（未設定）"), // ✅ name が空の場合の対応
        points: rows.map(r => r.total_points),
    };
}
async function getWeeklyReport() {
    const result = await client_1.db.query(`
    SELECT 
      name,
      weekly_points,
      weekly_tasks_completed
    FROM users
    WHERE weekly_points > 0
    ORDER BY weekly_points DESC
    LIMIT 10;
  `);
    const rows = result.rows;
    // ✅ 週間レポート用：データがない場合
    if (rows.length === 0) {
        return {
            ranks: ["1"],
            names: ["（まだ誰も達成していません）"],
            points: [0],
        };
    }
    return {
        ranks: rows.map((_, i) => String(i + 1)),
        names: rows.map(r => `${r.name || "（未設定）"} (${r.weekly_tasks_completed}回)`), // ✅ name が空の場合の対応
        points: rows.map(r => r.weekly_points),
    };
}
