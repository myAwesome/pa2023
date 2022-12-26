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
  const [selectedCategories, setSelectedCategories] = React.useState([
    'Продукты',
  ]);
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
    (d: any, cats: string[]) => {
      const cD: ([string, number] | [string])[] = [];
      const grouped: Record<string, any> = {};
      d.forEach((i: any) => {
        if (grouped[i.Date]) {
          grouped[i.Date].push(i);
        } else {
          grouped[i.Date] = [i];
        }
      });
      Object.entries(grouped).forEach(([month, trans]) => {
        const row: [string, number] | [string] = [month];
        cats.forEach((cat) => {
          const category = transCatsData.data.find(
            ({ name }: TransactionCategoryType) => name === cat,
          );
          row.push(
            trans.find((mC: any) => mC.Category === category?.id.toString())
              ?.Sum || 0,
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
      getChartData(d, ['Продукты']);
    });
  }, []);

  const handleSelect = (e: SelectChangeEvent<string[]>) => {
    setSelectedCategories(e.target.value as string[]);
    getChartData(data, e.target.value as string[]);
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
          <MenuItem key={cat.id} value={cat.name}>
            {cat.name}
          </MenuItem>
        ))}
      </Select>
      <Chart
        height={400}
        chartType="ColumnChart"
        loader={<div>Loading Chart</div>}
        data={[['Date', ...selectedCategories], ...chartData]}
        legendToggle
      />
    </div>
  );
};

export default TransactionsStatistics;
