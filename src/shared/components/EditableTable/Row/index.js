import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, TableCell, TableRow, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useDeleteMutation } from '../../../hooks/useDeleteMutation';

const Row = ({
  item,
  onEditClicked,
  deleteMutationFn,
  invalidateQueries,
  columns,
}) => {
  const [isDelete, setIsDelete] = React.useState(false);
  const deleteMutation = useDeleteMutation(
    deleteMutationFn,
    invalidateQueries,
    null,
    () => {
      setIsDelete(false);
    },
  );
  return isDelete ? (
    <TableRow>
      <TableCell colSpan={2}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => setIsDelete(false)}
        >
          CANCEL
        </Button>
      </TableCell>
      <TableCell colSpan={2}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => deleteMutation.mutate(item.id)}
        >
          DELETE
        </Button>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={item.id}>
      {columns.map((col) => (
        <TableCell key={`show-${col.name}`}>
          {col.render ? col.render(item, col) : item[col.name]}
        </TableCell>
      ))}
      <TableCell>
        <IconButton onClick={() => setIsDelete(true)}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={onEditClicked}>
          <EditIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

Row.propTypes = {
  item: PropTypes.object,
  onEditClicked: PropTypes.func,
  deleteMutationFn: PropTypes.func,
  invalidateQueries: PropTypes.arrayOf(PropTypes.string),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      label: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
};

export default Row;
