import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { getContextSegments, postPost } from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { ContextSegmentType } from '../../../shared/types';
import { dateToMySQLFormat } from '../../../shared/utils/mappers';
import ContextSegmentsPanel from './ContextSegmentsPanel';

dayjs.extend(utc);

const today = dayjs().format('YYYY-MM-DD');
const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
const createPost = (body: string, date: string) => ({
  body,
  date: dateToMySQLFormat(date),
});

const normalizeSegments = (val: any): ContextSegmentType[] => {
  if (Array.isArray(val)) {
    return val;
  }
  if (Array.isArray(val?.data)) {
    return val.data;
  }
  return [];
};

const PostCreate = () => {
  const [value, setValue] = React.useState('');
  const [date, setDate] = React.useState(today);
  const [isContextOpen, setContextOpen] = React.useState(false);
  const contextQuery = useQuery(['context_segments', date], () =>
    getContextSegments({ date }),
  );
  const createPostMutation = useCreateMutation(
    () => postPost(createPost(value, date)),
    ['recent_posts'],
    (old: any[]) => [
      {
        ...createPost(value, date),
        id: 0,
        labels: [],
        comments: [],
        periods: [],
        context_segments: [],
      },
      ...old,
    ],
    () => {
      setValue('');
    },
  );

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = () => {
    if (value) {
      createPostMutation.mutate(value);
    }
  };
  const appliedContext = normalizeSegments(contextQuery.data);

  return (
    <form style={{ marginBottom: '30px', textAlign: 'center' }}>
      <TextField
        multiline
        fullWidth
        rows={4}
        variant="outlined"
        value={value}
        onChange={handleText}
      />
      <Button
        style={{ marginRight: 15 }}
        type="button"
        onClick={() =>
          handleDate({
            target: { value: yesterday },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        color="inherit"
      >
        Yesterday
      </Button>
      <TextField
        style={{ marginRight: 15 }}
        type="date"
        value={date}
        onChange={handleDate}
        variant="standard"
      />
      <Button
        type="button"
        onClick={() =>
          handleDate({
            target: { value: today },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        color="inherit"
      >
        Today
      </Button>
      <Box
        sx={{
          marginTop: 1.5,
          marginBottom: 1,
          textAlign: 'left',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 1 }}
        >
          Applied context
        </Typography>
        {appliedContext.length ? (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {appliedContext.map((segment) => (
              <Chip
                key={segment.id}
                label={segment.title}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No context on this date.
          </Typography>
        )}
      </Box>
      <Button
        type="button"
        color="inherit"
        onClick={() => setContextOpen(true)}
      >
        Add context
      </Button>
      <Dialog
        open={isContextOpen}
        onClose={() => setContextOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Context</DialogTitle>
        <DialogContent>
          <ContextSegmentsPanel date={date} />
        </DialogContent>
      </Dialog>
      <Button
        fullWidth
        type="button"
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        Send
      </Button>
    </form>
  );
};

export default PostCreate;
