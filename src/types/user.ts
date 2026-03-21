export type User = {
  id: number;
  user_id: string;
  name: string;
  total_points: number;
  weekly_points: number;
  weekly_tasks_created: number;
  weekly_tasks_completed: number;
  created_at: Date;
};