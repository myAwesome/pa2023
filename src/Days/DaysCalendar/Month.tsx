import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { getCalendar } from '../../shared/utils/calendar';
import { LabelType, YearLabelsType } from '../../shared/types';
import TableHeadCell from './TableHeadCell';

type Props = {
  monthName: string;
  monthIndex: number;
  year: number;
  posts?: YearLabelsType[];
  selectedLabel: LabelType | null;
};

const Month = ({
  monthName,
  monthIndex,
  year,
  posts,
  selectedLabel,
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
              {week.map((day, j) => (
                <td key={j} align="center">
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '100%',
                      display: 'inline-block',
                      backgroundColor:
                        selectedLabel && day?.labels?.includes(selectedLabel.id)
                          ? selectedLabel?.color_active
                          : '',
                    }}
                  >
                    {day?.date}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default Month;
