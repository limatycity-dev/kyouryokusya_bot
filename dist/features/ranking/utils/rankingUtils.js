"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRankingEntriesTotal = toRankingEntriesTotal;
exports.toRankingEntriesWeekly = toRankingEntriesWeekly;
exports.formatWeeklySummary = formatWeeklySummary;
function toRankingEntriesTotal(rows) {
    return rows.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        points: row.total_point,
    }));
}
function toRankingEntriesWeekly(rows) {
    return rows.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        points: row.weekly_point,
    }));
}
function formatWeeklySummary(summary) {
    return [
        `今週のクエスト作成数: **${summary.weekly_tasks_created} 件**`,
        `今週のクエスト達成数: **${summary.weekly_tasks_completed} 件**`,
    ].join("\n");
}
