"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingRepository = void 0;
const client_1 = require("../../../db/client");
exports.rankingRepository = {
    async getRealtimeRanking(categoryId, limit = 10) {
        const result = await client_1.db.query(`
      SELECT user_id, category_id, total_point, weekly_point, updated_at
      FROM user_stats
      WHERE category_id = $1
      ORDER BY total_point DESC, user_id ASC
      LIMIT $2
      `, [categoryId, limit]);
        return result.rows;
    },
    async getWeeklyRanking(categoryId, limit = 10) {
        const result = await client_1.db.query(`
      SELECT user_id, category_id, total_point, weekly_point, updated_at
      FROM user_stats
      WHERE category_id = $1
      ORDER BY weekly_point DESC, user_id ASC
      LIMIT $2
      `, [categoryId, limit]);
        return result.rows;
    },
    async getWeeklySummary(categoryId) {
        const result = await client_1.db.query(`
      SELECT
        COALESCE(SUM(weekly_tasks_created), 0) AS weekly_tasks_created,
        COALESCE(SUM(weekly_tasks_completed), 0) AS weekly_tasks_completed
      FROM users
      `);
        return result.rows[0] ?? { weekly_tasks_created: 0, weekly_tasks_completed: 0 };
    },
    async upsertUserStats(userId, categoryId, deltaTotal, deltaWeekly) {
        await client_1.db.query(`
      INSERT INTO user_stats (user_id, category_id, total_point, weekly_point, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, category_id)
      DO UPDATE SET
        total_point = user_stats.total_point + EXCLUDED.total_point,
        weekly_point = user_stats.weekly_point + EXCLUDED.weekly_point,
        updated_at = NOW()
      `, [userId, categoryId, deltaTotal, deltaWeekly]);
    },
    async resetWeekly() {
        await client_1.db.query(`UPDATE users SET weekly_points = 0, weekly_tasks_created = 0, weekly_tasks_completed = 0`);
        await client_1.db.query(`UPDATE user_stats SET weekly_point = 0`);
    },
    async getSystemValue(key) {
        const result = await client_1.db.query(`SELECT value FROM system WHERE key = $1`, [key]);
        return result.rows[0]?.value ?? null;
    },
    async setSystemValue(key, value) {
        await client_1.db.query(`
      INSERT INTO system (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `, [key, value]);
    },
    async resetTotalPoints(categoryId) {
        await client_1.db.query(`
      UPDATE user_stats
      SET total_point = 0
      WHERE category_id = $1
      `, [categoryId]);
    },
};
