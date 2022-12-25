import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import SubmitIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Close';
import moment from 'moment';
import { ColumnType, TableItemType } from '../../../types/table';

const getInitialValues = (columns: ColumnType[], item: TableItemType) => {
  const initialValues: Record<string, any> = {};
  columns.forEach((col) => {
    if (col.type === 'date') {
      initialValues[col.name] = moment(item[col.name]).format('YYYY-MM-DD');
    } else if (col.type === 'nullable-date') {
      initialValues[col.name] = item[col.name] || '';
      initialValues[`is${col.name}InProgress`] = item.id
        ? !item[col.name]
        : false;
    } else if (col.type === 'select') {
      initialValues[col.name] =
        col.options.find((o) => o.name === item[col.name])?.id ||
        item[col.name];
    } else {
      initialValues[col.name] = item[col.name] || '';
    }
  });
  return initialValues;
};

type Props = {
  item: TableItemType;
  columns: ColumnType[];
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
};

const PeriodEditRow = ({ item, onSubmit, onCancel, columns }: Props) => {
  const [values, setValues] = React.useState(getInitialValues(columns, item));

  return (
    <TableRow key="new-period">
      {columns.map((col) => {
        if (col.type === 'date') {
          return (
            <TableCell key={`edit-${col.name}`}>
              <TextField
                name={col.name}
                type="date"
                variant="standard"
                value={values[col.name]}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                label={col.label}
                InputLabelProps={{ shrink: true }}
              />
            </TableCell>
          );
        } else if (col.type === 'nullable-date') {
          return (
            <TableCell key={`edit-${col.name}`}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values[`is${col.name}InProgress`]}
                    onChange={() =>
                      setValues({
                        ...values,
                        [`is${col.name}InProgress`]:
                          !values[`is${col.name}InProgress`],
                      })
                    }
                  />
                }
                label="Is in progress"
              />
              <br />
              <TextField
                name={col.name}
                type="date"
                variant="standard"
                value={values[col.name]}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                label={col.label}
                disabled={values[`is${col.name}InProgress`]}
                InputLabelProps={{ shrink: true }}
              />
            </TableCell>
          );
        } else if (col.type === 'select') {
          return (
            <TableCell key={`edit-${col.name}`}>
              <FormControl>
                <InputLabel>{col.label}</InputLabel>
                <Select
                  name={col.name}
                  value={values[col.name]}
                  onChange={(e) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                  }
                  variant="standard"
                >
                  {col.options.map((opt) => (
                    <MenuItem value={opt.id} key={opt.id}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
          );
        } else {
          return (
            <TableCell key={`edit-${col.name}`}>
              <TextField
                name={col.name}
                value={values[col.name]}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                variant="standard"
                label={col.label}
              />
            </TableCell>
          );
        }
      })}
      <TableCell key="column-actions">
        <IconButton onClick={() => onSubmit(values)}>
          <SubmitIcon />
        </IconButton>
        <IconButton onClick={onCancel}>
          <CancelIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default PeriodEditRow;
