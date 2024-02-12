import { FormControl, Grid, MenuItem, Select, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import Chip from '@mui/material/Chip';
import dayjs from 'dayjs';
import {
  getLabels,
  getPeriods,
  getYearLabels,
  getYears,
} from '../../shared/api/routes';
import {
  LabelsPerMonthType,
  LabelType,
  PeriodType,
  YearLabelsType,
} from '../../shared/types';
import PostLabel from '../PostLabel';
import Month from './Month';

const colors = [
  'rgba(255, 99, 71, 0.5)',
  'rgba(139, 0, 139, 0.5)',
  'rgba(0, 206, 209, 0.5)',
  'rgba(255, 69, 0, 0.5)',
  'rgba(0, 255, 0, 0.5)',
  'rgba(255, 0, 255, 0.5)',
  'rgba(0, 0, 255, 0.5)',
  'rgba(0, 128, 0, 0.5)',
  'rgba(255, 215, 0, 0.5)',
  'rgba(255,177,122,0.5)',
  'rgba(255, 105, 180, 0.5)',
  'rgba(30, 144, 255, 0.5)',
  'rgba(255, 165, 0, 0.5)',
  'rgba(50, 205, 50, 0.5)',
  'rgba(255, 192, 203, 0.5)',
  'rgba(154, 205, 50, 0.5)',
  'rgba(255, 20, 147, 0.5)',
  'rgba(255, 140, 0, 0.5)',
  'rgba(138, 43, 226, 0.5)',
  'rgba(255, 255, 0, 0.5)',
];

const DaysCalendar = () => {
  const [selectedYear, setSelectedYear] = React.useState(
    new Date().getFullYear(),
  );
  const [selectedLabel, setSelectedLabel] = useState<LabelType | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [hoveredPeriod, setHoveredPeriod] = useState(-1);
  const periodsData = useQuery(['periods'], getPeriods);
  const labelsData = useQuery(['labels'], getLabels);
  const yearsData = useQuery(['years'], getYears);
  const yearLabelsData = useQuery(['year_labels', selectedYear], () =>
    getYearLabels(selectedYear),
  );
  const labelsByMonth = useMemo(() => {
    if (yearLabelsData.data) {
      const perMonth: LabelsPerMonthType = {};
      yearLabelsData.data.forEach((post: YearLabelsType) => {
        const cell = perMonth[Number(post.m) as keyof LabelsPerMonthType];
        if (Array.isArray(cell)) {
          cell.push(post);
        } else {
          perMonth[Number(post.m) as keyof LabelsPerMonthType] = [post];
        }
      });
      return perMonth;
    }
    return {};
  }, [yearLabelsData.data]);

  const relevantPeriods: (PeriodType & { color: string })[] = useMemo(() => {
    const res = (periodsData?.data || [])
      .filter(
        (p: PeriodType) =>
          (dayjs(p.start).year() <= selectedYear &&
            dayjs(p.end).year() >= selectedYear) ||
          p.isendInProgress,
      )
      .map((p: PeriodType, i: number) => ({
        ...p,
        color: colors[i % colors.length],
      }));
    setSelectedPeriods(res.map((p: PeriodType) => p.id));
    return res;
  }, [periodsData?.data, selectedYear]);

  return (
    <Stack direction="column" gap={4}>
      <Grid container justifyContent="center" gap={2} alignItems="center">
        <Grid item>
          <FormControl fullWidth sx={{ maxWidth: 250 }}>
            <Select
              labelId="year-label"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
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
        <Grid item>
          {(labelsData.data || []).map((l: LabelType) => (
            <PostLabel
              key={l.id}
              label={l}
              isActive={selectedLabel?.id === l.id}
              onClick={() =>
                setSelectedLabel((prev) => (prev?.id === l.id ? null : l))
              }
            />
          ))}
        </Grid>
      </Grid>
      <Stack gap={2} direction="row" flexWrap="wrap">
        {relevantPeriods.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            sx={{
              backgroundColor: selectedPeriods.includes(p.id) ? p.color : '',
              '&:hover': {
                backgroundColor: selectedPeriods.includes(p.id)
                  ? p.color.replace(', 0.5)', ', 0.8)')
                  : '',
              },
            }}
            onMouseEnter={() => setHoveredPeriod(p.id)}
            onMouseLeave={() => setHoveredPeriod(-1)}
            onClick={() =>
              setSelectedPeriods((prev) =>
                prev.includes(p.id)
                  ? prev.filter((f) => f !== p.id)
                  : [...prev, p.id],
              )
            }
          />
        ))}
      </Stack>
      <Grid container rowGap={1} columnGap={2} justifyContent="center">
        {[
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ].map((m, i) => (
          <Grid item key={m}>
            <Month
              monthName={m}
              monthIndex={i + 1}
              year={selectedYear}
              posts={labelsByMonth[(i + 1) as keyof LabelsPerMonthType]}
              selectedLabel={selectedLabel}
              periods={relevantPeriods.filter((p) =>
                selectedPeriods.includes(p.id),
              )}
              hoveredPeriod={hoveredPeriod}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default DaysCalendar;
