import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useQuery } from '@tanstack/react-query';
import { getContextSegments, postPost } from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { ContextSegmentType } from '../../../shared/types';
import { dateToMySQLFormat } from '../../../shared/utils/mappers';
import ContextSegmentsPanel from './ContextSegmentsPanel';

dayjs.extend(utc);

const today = dayjs().format('YYYY-MM-DD');
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
      <Box
        sx={{
          marginTop: 1.5,
          marginBottom: 1,
          textAlign: 'left',
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {appliedContext.map((segment) => (
          <Chip
            key={segment.id}
            label={segment.title}
            variant="outlined"
            size="small"
          />
        ))}
        <IconButton size="small" onClick={() => setContextOpen(true)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <TextField
        style={{ marginBottom: 10 }}
        type="date"
        value={date}
        onChange={handleDate}
        variant="standard"
      />
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
