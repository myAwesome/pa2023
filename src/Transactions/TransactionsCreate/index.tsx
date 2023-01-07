import React from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';
import { useCreateMutation } from '../../shared/hooks/useCreateMutation';
import {
  getTransactionsCategories,
  postTransaction,
} from '../../shared/api/routes';
import { TransactionCategoryType, TransactionType } from '../../shared/types';
import { dateToMySQLFormat } from '../../shared/utils/mappers';

const initialValues = {
  description: '',
  amount: '',
  category: 31,
  currency: '',
  date: dayjs().format('YYYY-MM-DD'),
};

const thisMonth = dayjs().format('MMMM');
const thisYear = dayjs().year();

const TransactionsCreate = () => {
  const [values, setValues] = React.useState(initialValues);
  const transCatsData = useQuery(
    ['transactions_categories'],
    getTransactionsCategories,
  );
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const createMutation = useCreateMutation(
    (vals: TransactionType) => postTransaction(vals),
    ['transactions', thisYear, thisMonth],
    (old: TransactionType[], vals: TransactionType) =>
      old ? [...old, vals] : old,
    () => {
      setValues(initialValues);
      if (isMobile) {
        navigate('/transactions/list');
      }
    },
  );

  const handleChange = (e: {
    target: { name: string; value: number | string };
  }) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const submitTransaction = () => {
    const data = {
      ...values,
      amount: +values.amount,
      date: dateToMySQLFormat(values.date),
    };

    createMutation.mutate(data);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Grid container spacing={3}>
        <Grid item xs={12} container justifyContent="space-between">
          {[31, 52, 12, 63, 64, 60, 58].map((id) => (
            <Grid item key={id}>
              <Button
                variant="outlined"
                onClick={() =>
                  handleChange({ target: { value: id, name: 'category' } })
                }
              >
                {
                  transCatsData.data?.find(
                    (c: TransactionCategoryType) => c.id === id,
                  )?.name
                }
              </Button>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={6} alignSelf="flex-end">
          <Select
            value={values.category}
            onChange={handleChange}
            name="category"
            variant="standard"
            label="Category"
            fullWidth
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {transCatsData.data?.map((c: TransactionCategoryType) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={6}>
          <TextField
            type="date"
            label="Date"
            name="date"
            variant="standard"
            autoComplete="off"
            value={values.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { colorScheme: (theme) => theme.palette.mode } }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            type="number"
            label="Amount"
            name="amount"
            variant="standard"
            autoComplete="off"
            value={values.amount}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Currency"
            name="currency"
            variant="standard"
            value={values.currency}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <TextField
              type="text"
              variant="standard"
              value={values.description}
              onChange={handleChange}
              name="description"
              label="Comment"
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <Button
              type="submit"
              variant="contained"
              onClick={submitTransaction}
            >
              Submit
            </Button>
          </FormGroup>
        </Grid>
      </Grid>
    </form>
  );
};

export default TransactionsCreate;
