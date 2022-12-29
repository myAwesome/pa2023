import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TasksByStatus, TaskType } from '../types';

dayjs.extend(utc);

export const mapTasksByStatus = (tasks: TaskType[]) => {
  const tasksByStatus: TasksByStatus = {
    incoming: [],
    todo: [],
    in_progress: [],
    done: [],
  };
  tasks.forEach((task) => {
    tasksByStatus[task.status].push({
      id: task.id,
      body: task.body,
      status: task.status,
      created_at: task.created_at,
      priority: task.priority,
      outcome: task.outcome,
      project_id: task.project_id,
    });
  });
  return tasksByStatus;
};

export const dateToMySQLFormat = (date?: string) => {
  return dayjs(date).utc(true).format('YYYY-MM-DD hh:mm:ss');
};
