import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TasksByStatus, TaskType } from '../types';

dayjs.extend(utc);

export const mapLabel = (label: {
  ID?: any;
  Name?: any;
  Color?: any;
  ColorActive?: any;
}) => ({
  id: label.ID,
  name: label.Name,
  color: label.Color,
  colorActive: label.ColorActive,
});

export const mapPeriod = (period: {
  ID: any;
  Name: any;
  Start: string;
  End: string;
}) => ({
  id: period.ID,
  name: period.Name,
  start: dayjs(period.Start).format('YYYY-MM-DD'),
  end:
    period.End === '0001-01-01T00:00:00Z'
      ? null
      : dayjs(period.End).format('YYYY-MM-DD'),
});

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
  return dayjs.utc(date).format('YYYY-MM-DD hh:mm:ss');
};
