import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  deleteContextSegment,
  getContextSegments,
  patchContextSegment,
  postContextSegment,
  splitContextSegment,
} from '../../../shared/api/routes';
import { ContextSegmentType } from '../../../shared/types';

type Props = {
  date: string;
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

const ContextSegmentsPanel = ({ date }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = ['context_segments', date];
  const [title, setTitle] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [startDate, setStartDate] = React.useState(date);
  const [endDate, setEndDate] = React.useState('');

  React.useEffect(() => {
    setStartDate(date);
  }, [date]);

  const { data } = useQuery(queryKey, () => getContextSegments({ date }));

  const refreshData = () => {
    queryClient.invalidateQueries(queryKey);
    queryClient.invalidateQueries(['recent_posts']);
    queryClient.invalidateQueries(['history_posts']);
  };

  const createMutation = useMutation(postContextSegment, {
    onSuccess: () => {
      setTitle('');
      setDetails('');
      setEndDate('');
      refreshData();
    },
  });

  const editMutation = useMutation(
    ({
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
    {
      onSuccess: refreshData,
    },
  );

  const splitMutation = useMutation(
    ({
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
    {
      onSuccess: refreshData,
    },
  );

  const deleteMutation = useMutation((id: number) => deleteContextSegment(id), {
    onSuccess: refreshData,
  });

  const isValidDateRange = !endDate || endDate >= startDate;
  const isBusy =
    createMutation.isLoading ||
    editMutation.isLoading ||
    splitMutation.isLoading ||
    deleteMutation.isLoading;

  const segments = normalizeSegments(data);

  const handleCreate = () => {
    if (!title.trim() || !isValidDateRange) {
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      details: details.trim(),
      start_date: startDate,
      end_date: endDate || null,
    });
  };

  const handleEdit = (segment: ContextSegmentType) => {
    const newTitle = window.prompt('Title', segment.title);
    if (newTitle === null || !newTitle.trim()) {
      return;
    }
    const newDetails = window.prompt('Details', segment.details || '');
    if (newDetails === null) {
      return;
    }
    const newStartDate = window.prompt(
      'Start date (YYYY-MM-DD)',
      segment.start_date,
    );
    if (!newStartDate) {
      return;
    }
    const currentEndDate = segment.end_date || '';
    const newEndDate = window.prompt(
      'End date (YYYY-MM-DD) or empty',
      currentEndDate,
    );
    if (newEndDate === null) {
      return;
    }
    const normalizedEndDate = newEndDate.trim() || null;
    if (normalizedEndDate && normalizedEndDate < newStartDate) {
      return;
    }

    editMutation.mutate({
      id: segment.id,
      data: {
        title: newTitle.trim(),
        details: newDetails,
        start_date: newStartDate,
        end_date: normalizedEndDate,
      },
    });
  };

  const handleSplit = (segment: ContextSegmentType) => {
    const splitDate = window.prompt('Split from date (YYYY-MM-DD)', date);
    if (!splitDate) {
      return;
    }
    const newTitle = window.prompt('New title', segment.title);
    if (newTitle === null || !newTitle.trim()) {
      return;
    }
    const newDetails = window.prompt('New details', segment.details || '');
    if (newDetails === null) {
      return;
    }
    splitMutation.mutate({
      id: segment.id,
      data: {
        splitDate,
        newTitle: newTitle.trim(),
        newDetails,
      },
    });
  };

  const handleDelete = (segmentId: number) => {
    if (!window.confirm('Delete this context segment?')) {
      return;
    }
    deleteMutation.mutate(segmentId);
  };

  return (
    <Box
      sx={{
        marginBottom: 2,
        padding: (theme) => theme.spacing(2),
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        Active context for {dayjs(date).format('YYYY-MM-DD')}
      </Typography>
      {segments.length ? (
        <Stack spacing={1} sx={{ marginBottom: 2 }}>
          {segments.map((segment) => (
            <Box
              key={segment.id}
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                padding: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  label={segment.title}
                  color="primary"
                  variant="outlined"
                  title={segment.details}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleEdit(segment)}
                    disabled={isBusy}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleSplit(segment)}
                    disabled={isBusy}
                  >
                    Split
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleDelete(segment.id)}
                    disabled={isBusy}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
              {segment.details ? (
                <Typography
                  variant="body2"
                  sx={{ marginTop: 0.5, whiteSpace: 'pre-wrap' }}
                >
                  {segment.details}
                </Typography>
              ) : null}
              <Typography variant="caption" color="text.secondary">
                {segment.start_date} - {segment.end_date || 'ongoing'}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          No active context segments on this date.
        </Typography>
      )}

      <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
        Add context segment
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
        />
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          size="small"
        />
        <Stack direction="row" spacing={1.5}>
          <TextField
            fullWidth
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
        {!isValidDateRange ? (
          <Alert severity="warning">
            End date cannot be before start date.
          </Alert>
        ) : null}
        <Button
          variant="outlined"
          onClick={handleCreate}
          disabled={isBusy || !title.trim() || !isValidDateRange}
        >
          Add context
        </Button>
      </Stack>
    </Box>
  );
};

export default ContextSegmentsPanel;
