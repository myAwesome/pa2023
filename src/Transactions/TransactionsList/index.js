import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  Grid,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
  Hidden,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import Table from '../../shared/components/Table';
import EditableTable from '../../shared/components/EditableTable';
import {
  getTransactionsByMonthAndYear,
  getTransactionsCategories,
  putTransaction,
  deleteTransaction,
} from '../../shared/api/routes';
dayjs.extend(utc);

const thisMonth = dayjs().format('MMMM');
const thisYear = dayjs().year();
const startDate = dayjs('2018-06-01');
const yearsSinceStart = thisYear - startDate.year();

const mobileColumns = [
  {
    title: '',
    field: 'amount',
    render: (row) => (
      <div>
        <div>
          <b>{row.amount}</b>
        </div>
        <div>
          <sub>{row.description}</sub>
        </div>
      </div>
    ),
  },
  {
    title: '',
    field: 'date',
    render: (row) => (
      <div>
        <div>{row.category}</div>
        <div>
          <sub>{dayjs(row.date).format('ddd D MMM')}</sub>
        </div>
      </div>
    ),
  },
];

const categoryColumns = [
  { title: 'Sum', field: 'sum' },
  {
    title: 'Percentage',
    field: 'percentage',
    render: (row) => (
      <div style={{ width: `${row.percentage}%`, backgroundColor: '#af8f85' }}>
        {row.percentage}
      </div>
    ),
  },
  { title: 'Category', field: 'category' },
];

const getYears = () => {
  const years = [];
  for (let i = 0; i <= yearsSinceStart; i++) {
    const year = dayjs().subtract(i, 'years').format('YYYY');
    years.push(
      <MenuItem value={year} key={year}>
        {year}
      </MenuItem>,
    );
  }
  return years;
};

const TransactionsList = () => {
  const [selectedMonth, setSelectedMonth] = React.useState(thisMonth);
  const [selectedYear, setSelectedYear] = React.useState(thisYear);
  const [groupByCategory, setGroupByCategory] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const transCatsData = useQuery(
    ['transactions_categories'],
    getTransactionsCategories,
  );
  const transactionsData = useQuery(
    ['transactions', selectedYear, selectedMonth],
    () => {
      return getTransactionsByMonthAndYear(
        selectedYear,
        dayjs().month(selectedMonth).format('M'),
      );
    },
  );
  const trState = React.useMemo(() => {
    if (!transactionsData.data || !transCatsData.data) {
      return { transactions: [], transactionsByCat: [] };
    }
    const newTransactions = transactionsData.data.reverse().map((tr) => ({
      ...tr,
      category: transCatsData.data.find((c) => c.id === tr.category)?.name,
    }));
    const newTotal = newTransactions.reduce(
      (prev, curr) => prev + curr.amount,
      0,
    );
    const newCategoryData = transCatsData.data
      .map((category) => {
        const filtered = newTransactions.filter(
          (tr) => tr.category === category.name,
        );
        const sum = filtered.reduce((prev, curr) => prev + curr.amount, 0);
        const percentage = ((sum / newTotal) * 100).toFixed(1);
        return { sum, percentage, category: category.name };
      })
      .sort((a, b) => (a.sum > b.sum ? -1 : 1));
    return {
      total: newTotal,
      categories: transCatsData.data,
      transactions: newTransactions,
      transactionsByCat: newCategoryData,
    };
  }, [transactionsData.data, transCatsData.data]);

  const onMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const onYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const onGroupByChange = (e) => {
    setGroupByCategory(e.target.checked);
  };

  return (
    <div>
      <Hidden smUp>
        <Button
          fullWidth
          variant="contained"
          style={{ marginBottom: 10 }}
          onClick={() => navigate('/transactions/add')}
        >
          Add
        </Button>
      </Hidden>
      <Grid container justifyContent="space-around">
        <Grid item>
          <Select
            value={selectedMonth}
            onChange={onMonthChange}
            variant="standard"
          >
            {dayjs.months().map((m) => (
              <MenuItem value={m} key={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <Select
            value={selectedYear}
            onChange={onYearChange}
            variant="standard"
          >
            {getYears()}
          </Select>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox value={groupByCategory} onChange={onGroupByChange} />
            }
            label="Group By Category"
          />
        </Grid>
      </Grid>
      <p>
        <b>
          {selectedMonth} {selectedYear} ({trState.total})
        </b>
      </p>
      {groupByCategory || isMobile ? (
        <Table
          data={
            groupByCategory ? trState.transactionsByCat : trState.transactions
          }
          columns={groupByCategory ? categoryColumns : mobileColumns}
          size={isMobile ? 'small' : undefined}
        />
      ) : (
        <EditableTable
          items={trState.transactions}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          columns={[
            { label: 'Amount', name: 'amount', type: 'string' },
            {
              label: 'Category',
              name: 'category',
              type: 'select',
              options: trState.categories,
            },
            { label: 'Description', name: 'description', type: 'string' },
            {
              label: 'Date',
              name: 'date',
              render: (row) => dayjs(row.date).format('YYYY-MM-DD'),
              type: 'date',
            },
          ]}
          editMutationFn={({ id, ...values }) => putTransaction(id, values)}
          invalidateQueries={['transactions', selectedYear, selectedMonth]}
          getNewItemFn={(values) => ({
            amount: Number(values.amount),
            category: values.category,
            description: values.description,
            date: dayjs.utc(values.date).format(),
          })}
          deleteMutationFn={(id) => deleteTransaction(id)}
        />
      )}
    </div>
  );
};

export default TransactionsList;
