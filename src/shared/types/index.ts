export type PeriodType = {
  id: string;
  ID: string;
  name: string;
  Name: string;
  start: string;
  end: string;
  isendInProgress: boolean;
};

export type PhotoType = {
  id: string;
  baseUrl: string;
  mediaMetadata: {
    creationTime: string;
  };
};

export type PostType = {
  id: string;
  date: number;
  labels: LabelType[];
  comments: CommentType[];
  body: string;
  periods: PeriodType[];
};

export type LabelType = {
  ID?: string;
  id?: string;
  name?: string;
  color?: string;
  colorActive?: string;
};

export type CommentType = {
  ID: string;
  Body: string;
  Date: string;
  PostId: string;
};

export type LastTimeItemType = {
  id: string;
  body: string;
  date: string;
  remind_after_days: string | number;
};

export type YearMonthsType = {
  YM: string;
  Cnt: string;
  M: string;
};

export enum TaskStatus {
  INCOMING = 'incoming',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export type TaskType = {
  status: TaskStatus;
  id: string;
  body: string;
  created_at: string;
  priority: number;
  outcome: string;
};
