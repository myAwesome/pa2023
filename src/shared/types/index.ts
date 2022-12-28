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
  expired: boolean;
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
  project_id: string;
  archived?: boolean;
};

export type NoteCategoryType = {
  id: string;
  name: string;
  note_count: number;
};

export type NoteType = {
  id: string;
  body: string;
  note_category: string;
};

export type ProjectType = {
  id: string;
  title: string;
  description: string;
  archived: boolean;
};

export type TasksByStatus = {
  [TaskStatus.INCOMING]: TaskType[];
  [TaskStatus.TODO]: TaskType[];
  [TaskStatus.IN_PROGRESS]: TaskType[];
  [TaskStatus.DONE]: TaskType[];
};

export type TransactionCategoryType = {
  id: number;
  name: string;
};

export type TransactionType = {
  id: number;
  amount: string;
  description: string;
  date: string;
  category: number;
  group_id: number;
};

export type WishType = {
  id: string;
  name: string;
  picture: string;
  price_from: number;
  price_to: number;
  is_done: boolean;
  created_at: string;
};
