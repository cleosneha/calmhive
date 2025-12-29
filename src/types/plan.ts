/**
 * Plan and Task-related types for CalmHive
 */

/**
 * Task priority levels
 */
export type TaskPriority = "low" | "medium" | "high";

/**
 * Task status
 */
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled";

/**
 * Individual task structure
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date | string;
  completedAt?: Date | string;
}

/**
 * Plan from database
 */
export interface Plan {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  tasks: Task[]; // Stored as JSON in DB
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create plan input
 */
export interface CreatePlanInput {
  title: string;
  description?: string;
  tasks: Task[];
}

/**
 * Update plan input
 */
export interface UpdatePlanInput {
  title?: string;
  description?: string;
  tasks?: Task[];
}

/**
 * Plan with user data
 */
export interface PlanWithUser extends Plan {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}
