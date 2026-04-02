import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useQuery } from '@tanstack/react-query';
import PostShow from '../PostShow';
import { getLabels, getMonth, getYears } from '../../shared/api/routes';
import { PostMonth, PostMonthsByYear, PostType } from '../../shared/types';
import Calendar from './Calendar';

const DaysApp = () => {
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [selectedYear, setSelectedYear] = React.useState('');
  const labelsData = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  });
  const yearsData = useQuery({
    queryKey: ['years'],
    queryFn: getYears,
  });
  const monthData = useQuery({
    queryKey: ['selected_month', selectedMonth],
    queryFn: () => getMonth(selectedMonth),
    enabled: !!selectedMonth,
  });

  const handleYearChange = (e: SelectChangeEvent<string>) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthChange = (e: SelectChangeEvent<string>) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <Grid container spacing={3}>
      <Grid container xs={12} md={5} direction="column">
        <Grid container>
          <Grid
            xs={4}
            sm={4}
            sx={{
              marginRight: (theme) => theme.spacing(2),
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="year-label">Year</InputLabel>
              <Select
                labelId="year-label"
                value={selectedYear}
                onChange={handleYearChange}
                variant="standard"
              >
                {Object.keys(yearsData.data || {}).map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={7} sm={6}>
            <FormControl disabled={!selectedYear} fullWidth>
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                value={selectedMonth}
                onChange={handleMonthChange}
                variant="standard"
              >
                {selectedYear &&
                  (yearsData.data as PostMonthsByYear)[selectedYear].map(
                    (m: PostMonth) => (
                      <MenuItem key={m.ym} value={m.ym}>
                        {m.m} ({m.count})
                      </MenuItem>
                    ),
                  )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container direction="column">
          {(monthData.data || []).map((p: PostType) => (
            <Grid
              key={p.id}
              sx={{
                marginTop: (theme) => theme.spacing(3),
                position: 'relative',
              }}
            >
              <span
                id={p.id.toString()}
                style={{ position: 'absolute', top: -100 }}
              />
              <PostShow
                post={{ ...p, labels: p.labels || [] }}
                labels={labelsData.data || []}
                invalidateQueries={['selected_month', selectedMonth]}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid xs={12} md={7}>
        <Calendar
          year={selectedYear}
          month={selectedMonth?.slice(3)}
          posts={monthData.data || []}
          labels={labelsData.data || []}
        />
      </Grid>
    </Grid>
  );
};

export default DaysApp;
