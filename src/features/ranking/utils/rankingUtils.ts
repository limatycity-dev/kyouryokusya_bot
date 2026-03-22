import { UserStatsRow, WeeklySummary } from "../repository/rankingRepository";

export interface RankingEntry {
  rank: number;
  userId: string;
  points: number;
}

export function toRankingEntriesTotal(rows: UserStatsRow[]): RankingEntry[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    points: row.total_point,
  }));
}

export function toRankingEntriesWeekly(rows: UserStatsRow[]): RankingEntry[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    points: row.weekly_point,
  }));
}

export function formatWeeklySummary(summary: WeeklySummary): string {
  return [
    `今週のクエスト作成数: **${summary.weekly_tasks_created} 件**`,
    `今週のクエスト達成数: **${summary.weekly_tasks_completed} 件**`,
  ].join("\n");
}