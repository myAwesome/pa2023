import { FormControl, Grid, MenuItem, Select, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { getLabels, getYearLabels, getYears } from '../../shared/api/routes';
import {
  LabelsPerMonthType,
  LabelType,
  YearLabelsType,
} from '../../shared/types';
import PostLabel from '../PostLabel';
import Month from './Month';

const DaysCalendar = () => {
  const [selectedYear, setSelectedYear] = React.useState(
    new Date().getFullYear(),
  );
  const [selectedLabel, setSelectedLabel] = useState<LabelType | null>(null);
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
              onClick={() => setSelectedLabel(l)}
            />
          ))}
        </Grid>
      </Grid>
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
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default DaysCalendar;
