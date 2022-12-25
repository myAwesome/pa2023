import { ReactElement } from 'react';

export type ColumnType = {
  name: string;
  label: string;
  type: 'date' | 'nullable-date' | 'select' | 'text' | 'number';
  options: { name: string; id: string }[];
  render?: (item: TableItemType, col: ColumnType) => ReactElement;
};

export type TableItemType = Record<string, any>;

export type TransactionsRowType = {
  id: string;
  category: string;
  date: string;
};

export type TransactionsColumnType = {
  field: keyof TransactionsRowType;
  title: string;
  render: (
    row: TransactionsRowType,
    column: TransactionsColumnType,
  ) => ReactElement;
};
