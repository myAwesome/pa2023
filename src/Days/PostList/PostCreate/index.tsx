import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteContextSegment,
  getContextSegments,
  patchContextSegment,
  postContextSegment,
  postPost,
  splitContextSegment,
} from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { ContextSegmentType } from '../../../shared/types';
import { dateToMySQLFormat } from '../../../shared/utils/mappers';
import MarkdownToolbar from '../../../shared/components/MarkdownToolbar';

dayjs.extend(utc);

const today = dayjs().format('YYYY-MM-DD');
const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
const createPost = (body: string, date: string) => ({
  body,
  date: dateToMySQLFormat(date),
});

const toInputDate = (value?: string | null): string => {
  if (!value) {
    return '';
  }
  const normalized = dayjs(value);
  if (normalized.isValid()) {
    return normalized.format('YYYY-MM-DD');
  }
  return value.slice(0, 10);
};

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
  const queryClient = useQueryClient();
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLTextAreaElement | HTMLInputElement | null>(
    null,
  );
  const [date, setDate] = React.useState(today);
  const [isAddContextOpen, setAddContextOpen] = React.useState(false);
  const [selectedContext, setSelectedContext] =
    React.useState<ContextSegmentType | null>(null);
  const [title, setTitle] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [startDate, setStartDate] = React.useState(today);
  const [endDate, setEndDate] = React.useState('');
  const [splitDate, setSplitDate] = React.useState(today);
  const contextQuery = useQuery({
    queryKey: ['context_segments', date],
    queryFn: () => getContextSegments({ date }),
  });
  const refreshContextData = () => {
    queryClient.invalidateQueries({ queryKey: ['context_segments', date] });
    queryClient.invalidateQueries({ queryKey: ['recent_posts'] });
    queryClient.invalidateQueries({ queryKey: ['history_posts'] });
  };
  const createContextMutation = useMutation({
    mutationFn: postContextSegment,
    onSuccess: () => {
      setTitle('');
      setDetails('');
      setStartDate(date);
      setEndDate('');
      setAddContextOpen(false);
      refreshContextData();
    },
  });
  const editContextMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        details?: string;
        start_date?: string;
        end_date?: string | null;
      };
    }) => patchContextSegment(id, data),
    onSuccess: () => {
      setSelectedContext(null);
      refreshContextData();
    },
  });
  const splitContextMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        splitDate: string;
        newTitle?: string;
        newDetails?: string;
      };
    }) => splitContextSegment(id, data),
    onSuccess: () => {
      setSelectedContext(null);
      refreshContextData();
    },
  });
  const deleteContextMutation = useMutation({
    mutationFn: (id: number) => deleteContextSegment(id),
    onSuccess: () => {
      setSelectedContext(null);
      refreshContextData();
    },
  });
  const createPostMutation = useCreateMutation(
    (payload: { body: string; date: string }) => postPost(payload),
    ['recent_posts'],
    (old: any[] = [], payload: { body: string; date: string }) => [
      {
        ...payload,
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
      createPostMutation.mutate(createPost(value, date));
    }
  };
  const isValidDateRange = !endDate || endDate >= startDate;
  const handleCreateContext = () => {
    if (!title.trim() || !isValidDateRange) {
      return;
    }
    createContextMutation.mutate({
      title: title.trim(),
      details: details.trim(),
      start_date: startDate,
      end_date: endDate || null,
    });
  };
  const openContextDialog = (segment: ContextSegmentType) => {
    setSelectedContext(segment);
    setTitle(segment.title || '');
    setDetails(segment.details || '');
    setStartDate(toInputDate(segment.start_date) || toInputDate(date));
    setEndDate(toInputDate(segment.end_date));
    setSplitDate(toInputDate(date));
  };
  const handleEditContext = () => {
    if (!selectedContext || !title.trim()) {
      return;
    }
    if (endDate && endDate < startDate) {
      return;
    }
    editContextMutation.mutate({
      id: selectedContext.id,
      data: {
        title: title.trim(),
        details,
        start_date: startDate,
        end_date: endDate || null,
      },
    });
  };
  const handleSplitContext = () => {
    if (!selectedContext || !splitDate) {
      return;
    }
    splitContextMutation.mutate({
      id: selectedContext.id,
      data: {
        splitDate,
        newTitle: title.trim() || selectedContext.title,
        newDetails: details,
      },
    });
  };
  const handleDeleteContext = () => {
    if (!selectedContext) {
      return;
    }
    if (!window.confirm('Delete this context segment?')) {
      return;
    }
    deleteContextMutation.mutate(selectedContext.id);
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
        inputRef={inputRef}
      />
      <MarkdownToolbar
        value={value}
        onChange={setValue}
        inputRef={inputRef}
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
            clickable
            onClick={() => openContextDialog(segment)}
            sx={{
              borderColor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.text.primary,
              '&:hover': {
                borderColor: (theme) => theme.palette.primary.main,
              },
            }}
          />
        ))}
        <IconButton
          size="small"
          onClick={() => {
            setTitle('');
            setDetails('');
            setStartDate(date);
            setEndDate('');
            setAddContextOpen(true);
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Button
        style={{ marginRight: 15 }}
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
        onClick={() =>
          handleDate({
            target: { value: today },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        color="inherit"
      >
        Today
      </Button>
      <Dialog
        open={isAddContextOpen}
        onClose={() => setAddContextOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add context</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              marginTop: 1,
            }}
          >
            <TextField
              label="Title"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Details"
              size="small"
              multiline
              minRows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <TextField
              label="Start date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddContextOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateContext}
            variant="contained"
            disabled={!title.trim() || !isValidDateRange}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!selectedContext}
        onClose={() => setSelectedContext(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Context details</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              marginTop: 1,
            }}
          >
            <TextField
              label="Title"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Details"
              size="small"
              multiline
              minRows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <TextField
              label="Start date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Split from date"
              type="date"
              size="small"
              value={splitDate}
              onChange={(e) => setSplitDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteContext} color="inherit">
            Delete
          </Button>
          <Button onClick={handleSplitContext} color="inherit">
            Split
          </Button>
          <Button onClick={handleEditContext} variant="contained">
            Save
          </Button>
        </DialogActions>
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
