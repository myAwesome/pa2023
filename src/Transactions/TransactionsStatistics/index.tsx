import React from 'react';
import { Chart } from 'react-google-charts';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useQuery } from '@tanstack/react-query';
import { SelectChangeEvent } from '@mui/material';
import {
  getTransactionsCategories,
  getTransactionsStatistics,
} from '../../shared/api/routes';
import { TransactionCategoryType } from '../../shared/types';

const TransactionsStatistics = () => {
  const [selectedCategories, setSelectedCategories] = React.useState([31]);
  const [data, setData] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<
    ([string, number] | [string])[]
  >([]);
  const transCatsData = useQuery(
    ['transactions_categories'],
    getTransactionsCategories,
    {
      initialData: [],
    },
  );

  const getChartData = React.useCallback(
    (d: any, cats: number[]) => {
      const cD: ([string, number] | [string])[] = [];
      const grouped: Record<string, any> = {};
      d.forEach((i: any) => {
        if (grouped[i.date]) {
          grouped[i.date].push(i);
        } else {
          grouped[i.date] = [i];
        }
      });
      Object.entries(grouped).forEach(([month, trans]) => {
        const row: [string, number] | [string] = [month];
        cats.forEach((cat) => {
          const category = transCatsData.data.find(
            ({ id }: TransactionCategoryType) => id === cat,
          );
          const transactionByCategory = trans.find(
            (mC: any) => mC.category === category?.id,
          );
          row.push(
            // @ts-ignore
            transactionByCategory ? Number(transactionByCategory.sum) : 0,
          );
        });
        cD.push(row);
      });
      setChartData(cD);
    },
    [transCatsData.data],
  );

  React.useEffect(() => {
    getTransactionsStatistics().then((resp) => {
      const d = Object.values(resp);
      setData(d);
      getChartData(d, [31]);
    });
  }, [transCatsData.data]);

  const handleSelect = (e: SelectChangeEvent<number[]>) => {
    setSelectedCategories(e.target.value as number[]);
    getChartData(data, e.target.value as number[]);
  };

  return (
    <div>
      <Select
        style={{ marginBottom: 10 }}
        fullWidth
        multiple
        variant="standard"
        value={selectedCategories}
        onChange={handleSelect}
      >
        {transCatsData.data.map((cat: TransactionCategoryType) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name} ({cat.id})
          </MenuItem>
        ))}
      </Select>
      <Chart
        height={400}
        chartType="ColumnChart"
        loader={<div>Loading Chart</div>}
        data={[
          [
            'Date',
            ...selectedCategories.map(
              (cat) =>
                transCatsData.data?.find(
                  ({ id }: TransactionCategoryType) => id === Number(cat),
                )?.name || cat.toString(),
            ),
          ],
          ...chartData,
        ]}
        legendToggle
      />
    </div>
  );
};

export default TransactionsStatistics;
