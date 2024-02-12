import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { getCalendar } from '../../shared/utils/calendar';
import { LabelType, PeriodType, YearLabelsType } from '../../shared/types';
import TableHeadCell from './TableHeadCell';

type Props = {
  monthName: string;
  monthIndex: number;
  year: number;
  posts?: YearLabelsType[];
  selectedLabel: LabelType | null;
  periods: (PeriodType & { color: string })[];
  hoveredPeriod: number;
};

const Month = ({
  monthName,
  monthIndex,
  year,
  posts,
  selectedLabel,
  periods,
  hoveredPeriod,
}: Props) => {
  const days = useMemo(() => {
    return getCalendar(monthIndex, year).map((week) => {
      return week.map((day) => {
        const labels = posts?.find((p) => Number(p.d) === day?.date)?.labels;
        return { ...day, labels: labels || [] };
      });
    });
  }, [monthIndex, year, posts]);

  return (
    <Box>
      <Typography textAlign="center" color="secondary">
        {monthName}
      </Typography>

      <table>
        <thead>
          <tr>
            <TableHeadCell text="M" />
            <TableHeadCell text="T" />
            <TableHeadCell text="W" />
            <TableHeadCell text="T" />
            <TableHeadCell text="F" />
            <TableHeadCell text="S" />
            <TableHeadCell text="S" />
          </tr>
        </thead>
        <tbody>
          {days.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => {
                const currentDate = dayjs(`${year}-${monthIndex}-${day.date}`);
                const dayPeriods = periods.filter(
                  (period) =>
                    (currentDate.isSame(period.start, 'day') ||
                      currentDate.isAfter(period.start, 'day')) &&
                    (currentDate.isSame(period.end, 'day') ||
                      currentDate.isBefore(period.end, 'day')),
                );
                const hasMultiplePeriods = dayPeriods.length > 1;
                let backgroundColor = '';
                let backgroundImage = '';
                if (hasMultiplePeriods) {
                  const gradientStops = dayPeriods.map((period, index) => {
                    const start =
                      index === 0 ? 0 : (index / dayPeriods.length) * 100;
                    const end = ((index + 1) / dayPeriods.length) * 100;
                    return `${
                      hoveredPeriod > -1
                        ? hoveredPeriod === period.id
                          ? period.color.replace(', 0.5)', ', 0.8)')
                          : period.color.replace(', 0.5)', ', 0.2)')
                        : period.color
                    } ${start}% ${end}%`;
                  });
                  backgroundImage = `linear-gradient(to bottom, ${gradientStops.join(
                    ', ',
                  )})`;
                } else if (dayPeriods.length === 1) {
                  backgroundColor =
                    hoveredPeriod > -1
                      ? hoveredPeriod === dayPeriods[0].id
                        ? dayPeriods[0].color.replace(', 0.5)', ', 0.8)')
                        : dayPeriods[0].color.replace(', 0.5)', ', 0.2)')
                      : dayPeriods[0].color;
                }
                return (
                  <td key={j} align="center">
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '100%',
                        display: 'inline-block',
                        backgroundColor: selectedLabel
                          ? day?.labels?.includes(selectedLabel.id)
                            ? selectedLabel?.color_active
                            : ''
                          : backgroundColor,
                        backgroundImage: selectedLabel ? '' : backgroundImage,
                        position: 'relative',
                        cursor: 'default',
                      }}
                      title={
                        dayPeriods.length
                          ? dayPeriods.map((p) => p.name).join('; ')
                          : ''
                      }
                    >
                      {day?.date}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default Month;
