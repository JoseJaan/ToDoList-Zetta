export type TaskStatus = 'pendente' | 'concluida';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  expanded?: boolean;
}

export interface CreateTaskData {
  name: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}