export type PeriodType = {
  id: number;
  name: string;
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
  id: number;
  date: string;
  labels: number[];
  comments: CommentType[];
  body: string;
  periods: PeriodType[];
};

export type LabelType = {
  id: number;
  name?: string;
  color?: string;
  color_active?: string;
};

export type CommentType = {
  id: number;
  body: string;
  date: string;
  post_id: number;
};

export type LastTimeItemType = {
  id: number;
  body: string;
  date: string;
  remind_after_days: string | number;
  expired: boolean;
};

export type WatchItemType = {
  id: number;
  name: string;
  rating: number;
  type: 'movie' | 'series' | 'mini-series' | 'cartoon';
  last_seen: string;
  is_seen: boolean;
  created_at: string;
};

export enum TaskStatus {
  INCOMING = 'incoming',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export type TaskType = {
  status: TaskStatus;
  id: number;
  body: string;
  created_at: string;
  priority: number;
  outcome: string;
  project_id: string;
  archived?: boolean;
};

export type NoteCategoryType = {
  id: number;
  name: string;
};

export type NoteType = {
  id: number;
  body: string;
  note_category: string;
  created_at: string;
  updated_at: string;
};

export type ProjectType = {
  id: number;
  title: string;
  description: string;
  archived: boolean;
  created_at: string;
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
  id: number;
  name: string;
  picture: string;
  price_from: number;
  price_to: number;
  is_done: boolean;
  created_at: string;
};

export type PostMonth = {
  y: string;
  m: string;
  ym: string;
  count: number;
};

export type PostMonthsByYear = Record<string, PostMonth[]>;

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export type YearLabelsType = {
  d: string;
  m: string;
  date: string;
  id: number;
  labels: number[];
};

export type LabelsPerMonthType = {
  1?: YearLabelsType[];
  2?: YearLabelsType[];
  3?: YearLabelsType[];
  4?: YearLabelsType[];
  5?: YearLabelsType[];
  6?: YearLabelsType[];
  7?: YearLabelsType[];
  8?: YearLabelsType[];
  9?: YearLabelsType[];
  10?: YearLabelsType[];
  11?: YearLabelsType[];
  12?: YearLabelsType[];
};

export type CountdownType = {
  id: number;
  user_id: number;
  name: string;
  date: string;
  is_done: boolean;
};
