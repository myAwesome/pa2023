import React from 'react';
import PropTypes from 'prop-types';
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
import Row from './Row';
import EditRow from './EditRow';

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
}) => {
  const [editRow, setEditRow] = React.useState(null);
  const editMutation = useUpdateMutation(
    editMutationFn,
    invalidateQueries,
    null,
    getNewItemFn,
    () => {
      setEditRow(null);
    },
  );
  const onEditSubmit = (id, values) => {
    const data = getNewItemFn(values);
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

EditableTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      start: PropTypes.string,
      end: PropTypes.string,
    }),
  ),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      label: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  isAdd: PropTypes.bool,
  onAddSubmit: PropTypes.func,
  cancelAdd: PropTypes.func,
  size: PropTypes.string,
  editMutationFn: PropTypes.func,
  invalidateQueries: PropTypes.arrayOf(PropTypes.string),
  getNewItemFn: PropTypes.func,
  deleteMutationFn: PropTypes.func,
};

export default EditableTable;
