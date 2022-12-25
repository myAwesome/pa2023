import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useUpdateMutation } from '../../hooks/useUpdateMutation';
import { ColumnType, TableItemType } from '../../types/table';
import Row from './Row';
import EditRow from './EditRow';

type Props = {
  items: TableItemType[];
  columns: ColumnType[];
  isAdd: boolean;
  onAddSubmit: () => void;
  cancelAdd: () => void;
  editMutationFn: () => void;
  deleteMutationFn: () => void;
  getNewItemFn: (vals: TableItemType) => Record<string, any>;
  invalidateQueries: string[];
  size: 'small' | 'medium' | undefined;
};

const EditableTable = ({
  items,
  columns,
  isAdd,
  onAddSubmit,
  cancelAdd,
  size,
  editMutationFn,
  invalidateQueries,
  getNewItemFn,
  deleteMutationFn,
}: Props) => {
  const [editRow, setEditRow] = React.useState<number | null>(null);
  const editMutation = useUpdateMutation(
    editMutationFn,
    invalidateQueries,
    null,
    getNewItemFn,
    () => {
      setEditRow(null);
    },
  );
  const onEditSubmit = (id: string, values: TableItemType) => {
    const data = getNewItemFn(values);
    // @ts-ignore
    editMutation.mutate({ id, ...data });
  };
  return (
    <TableContainer component={Paper}>
      <Table size={size}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={`head-${col.name}`}>{col.label}</TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) =>
            i === editRow ? (
              <EditRow
                key={`edit=${item.id}`}
                item={item}
                onSubmit={(values) => onEditSubmit(item.id, values)}
                onCancel={() => setEditRow(null)}
                columns={columns}
              />
            ) : (
              <Row
                key={item.id}
                item={item}
                onEditClicked={() => setEditRow(i)}
                invalidateQueries={invalidateQueries}
                deleteMutationFn={deleteMutationFn}
                columns={columns}
              />
            ),
          )}
          {isAdd && (
            <EditRow
              item={{}}
              onSubmit={onAddSubmit}
              onCancel={cancelAdd}
              columns={columns}
            />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EditableTable;
