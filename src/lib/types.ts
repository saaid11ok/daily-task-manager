export interface Task {
  id: string;
  description: string;
  categories: string[];
  isCompleted: boolean;
  createdAt: number;
  date: string; // YYYY-MM-DD format
}

export type TaskFilter = 'all' | 'active' | 'completed';

export interface DayStats {
  total: number;
  completed: number;
  percentage: number;
}
