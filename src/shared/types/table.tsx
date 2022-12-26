import { ReactElement } from 'react';

export type SelectColumnType = {
  type: 'select';
  options: { name: string; id: string }[];
  render?: (item: TableItemType, col: ColumnType) => ReactElement | string;
  name: string;
  label: string;
};

export type ColumnType =
  | SelectColumnType
  | {
      name: string;
      label: string;
      type: 'date' | 'nullable-date' | 'select' | 'string' | 'number';
      render?: (item: TableItemType, col: ColumnType) => ReactElement | string;
    };

export type TableItemType = Record<string, any>;

export type TransactionsRowType = {
  id: string;
  category: string;
  date: string;
};

export type TransactionsColumnType = {
  field: keyof TableItemType | number;
  title: string;
  render?: (row: TableItemType, column: TransactionsColumnType) => ReactElement;
};
