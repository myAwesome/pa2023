import React from 'react';
import moment from 'moment';
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
  postTransactionsToMonthAndYear,
} from '../../shared/api/routes';

const initialValues = { description: '', amount: '', category: 31 };

const thisMonth = moment().format('MMMM');
const thisYear = moment().year();

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
    (vals) =>
      postTransactionsToMonthAndYear(
        thisYear,
        moment().month(thisMonth).format('M'),
        vals,
      ),
    ['transactions', thisYear, thisMonth],
    (old, vals) => (old ? [...old, vals] : old),
    () => {
      setValues(initialValues);
      if (isMobile) {
        navigate('/transactions/list');
      }
    },
  );

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const submitTransaction = () => {
    const data = {
      ...values,
      amount: +values.amount,
    };

    createMutation.mutate(data);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Grid container spacing={3}>
        <Grid item xs={12} container justifyContent="space-between">
          {[31, 34, 11, 12, 52, 22, 14].map((id) => (
            <Grid item key={id}>
              <Button
                variant="outlined"
                onClick={() =>
                  handleChange({ target: { value: id, name: 'category' } })
                }
              >
                {transCatsData.data?.find((c) => c.id === id)?.name}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <Select
              value={values.category}
              onChange={handleChange}
              name="category"
              variant="standard"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {transCatsData.data?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <TextField
              type="number"
              label="Amount"
              name="amount"
              variant="standard"
              autoComplete="off"
              value={values.amount}
              onChange={handleChange}
            />
          </FormGroup>
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
