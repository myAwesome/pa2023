import React from 'react';
import dayjs from 'dayjs';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type Props = {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
};

const HistoryDateSelector = ({ date, onChange }: Props) => {
  const d = dayjs(date);
  const today = dayjs().format('YYYY-MM-DD');
  const isToday = date === today;

  const goToPrev = () => onChange(d.subtract(1, 'day').format('YYYY-MM-DD'));
  const goToNext = () => onChange(d.add(1, 'day').format('YYYY-MM-DD'));
  const goToToday = () => onChange(today);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mb: 2,
      }}
    >
      <IconButton onClick={goToPrev} size="small">
        <ChevronLeftIcon />
      </IconButton>
      <TextField
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        variant="standard"
        size="small"
        sx={{ width: 140 }}
      />
      <IconButton onClick={goToNext} size="small">
        <ChevronRightIcon />
      </IconButton>
      {!isToday && (
        <Button onClick={goToToday} size="small" color="inherit">
          Today
        </Button>
      )}
    </Box>
  );
};

export default HistoryDateSelector;
