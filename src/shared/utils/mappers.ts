import moment from 'moment';
import { TaskType } from '../types';

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

export const mapPost = (post: {
  ID: any;
  Labels: any;
  Comments: any;
  Periods: any;
  Body: any;
  Date: string | any[];
}) => ({
  id: post.ID,
  labels: post.Labels,
  comments: post.Comments,
  periods: post.Periods,
  body: post.Body,
  date: post.Date.slice(0, 10),
});

export const mapPeriod = (period: {
  ID: any;
  Name: any;
  Start: moment.MomentInput;
  End: moment.MomentInput;
}) => ({
  id: period.ID,
  name: period.Name,
  start: moment(period.Start).format('YYYY-MM-DD'),
  end:
    period.End === '0001-01-01T00:00:00Z'
      ? null
      : moment(period.End).format('YYYY-MM-DD'),
});

export const mapTasksByStatus = (tasks: TaskType[]) => {
  const tasksByStatus = {
    incoming: [] as TaskType[],
    todo: [] as TaskType[],
    in_progress: [] as TaskType[],
    done: [] as TaskType[],
  };
  tasks.forEach((task) => {
    tasksByStatus[task.status].push({
      id: task.id,
      body: task.body,
      status: task.status,
      created_at: task.created_at,
      priority: task.priority,
      outcome: task.outcome,
    });
  });
  return tasksByStatus;
};
