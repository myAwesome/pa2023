import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import { TableItemType, TransactionsColumnType } from '../../types/table';

type Props = {
  data: TableItemType[];
  columns: TransactionsColumnType[];
  size: 'small' | 'medium' | undefined;
};

const TransactionsTable = ({ columns, data, size }: Props) => {
  return (
    <TableContainer component={Paper}>
      <Table size={size}>
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell key={`head-${i}`}>{col.title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={
                row.id ||
                row.category ||
                // @ts-ignore
                row.reduce((prev, cur) => prev + cur.date || 0, 0)
              }
            >
              {columns.map((col, i) => (
                <TableCell key={`body-${i}`}>
                  {col.render ? col.render(row, col) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionsTable;
