import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import {
  getCountdowns,
  postCountdown,
  editCountdown,
  deleteCountdown,
} from '../shared/api/routes';
import { CountdownType } from '../shared/types';
import { useCreateMutation } from '../shared/hooks/useCreateMutation';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../shared/hooks/useDeleteMutation';
import AddCountdown from './AddCountdown';
import calendarIcon from './calendar.svg';

const Countdown = () => {
  const [countdownToEdit, setCountdownToEdit] =
    React.useState<CountdownType | null>(null);
  const [isAdd, setIsAdd] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const { data, isLoading } = useQuery(['countdown'], getCountdowns);

  const addMutation = useCreateMutation(
    (values: CountdownType) => postCountdown(values),
    ['countdown'],
    (old: CountdownType[], values: CountdownType) => [values, ...old],
    () => {
      setIsAdd(false);
    },
  );
  const editMutation = useUpdateMutation(
    (values: CountdownType) => editCountdown(countdownToEdit?.id || 0, values),
    ['countdown'],
    countdownToEdit?.id,
    (values: CountdownType) => values,
    () => {
      setIsEdit(false);
      setCountdownToEdit(null);
    },
    ['countdown', countdownToEdit?.id],
  );
  const deleteMutation = useDeleteMutation(
    (id: number) => deleteCountdown(id),
    ['countdown'],
  );

  const handleSubmit = (
    values: Omit<CountdownType, 'id' | 'created_at' | 'user_id' | 'is_done'>,
  ) => {
    if (isAdd) {
      addMutation.mutate(values);
    } else {
      editMutation.mutate(values);
    }
  };

  const handleEditClick = (
    e: React.MouseEvent<HTMLDivElement>,
    countdown: CountdownType,
  ) => {
    e.stopPropagation();
    setIsEdit(true);
    setIsAdd(false);
    setCountdownToEdit(countdown);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setIsAdd(false);
    setCountdownToEdit(null);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setIsEdit(false);
    setCountdownToEdit(null);
  };

  return (
    <div>
      <h1>Countdown</h1>
      {isLoading && <LinearProgress />}
      <Grid container gap={4}>
        {data?.map((c: CountdownType) => (
          <Box
            key={c.id}
            sx={{
              width: 300,
              height: 300,
              backgroundImage: `url(${calendarIcon})`,
              backgroundSize: 'cover',
              color: (theme) => theme.palette.getContrastText('#fff'),
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={(e) => handleEditClick(e, c)}
          >
            <IconButton
              sx={{
                position: 'absolute',
                top: '10%',
                left: '45%',
                color: (theme) => theme.palette.getContrastText('#fff'),
              }}
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate(c.id);
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                position: 'relative',
                top: '50%',
                textAlign: 'center',
              }}
            >
              <Typography variant="h4">
                {dayjs(c.date).diff(dayjs(), 'day')}
              </Typography>
              <Typography>days</Typography>
              <Typography sx={{ mt: 3 }} variant="h6">
                to {c.name}
              </Typography>
            </Box>
          </Box>
        ))}
      </Grid>
      <IconButton onClick={handleAdd}>
        <AddIcon />
      </IconButton>
      {(isAdd || isEdit) && (
        <AddCountdown
          handleSubmit={handleSubmit}
          initialValues={countdownToEdit}
          handleCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Countdown;
