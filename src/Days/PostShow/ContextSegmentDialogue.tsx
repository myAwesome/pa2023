import { ContextSegmentType } from '../../shared/types';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import Button from '@mui/material/Button';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteContextSegment,
  patchContextSegment,
  postContextSegment,
  splitContextSegment,
} from '../../shared/api/routes';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(relativeTime);

type Props = {
  selectedContext: ContextSegmentType | null;
  isOpen: boolean;
  onClose: () => void;
  postDate: string;
  invalidateQueries: QueryKey;
};

const toInputDate = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD') : '';

export function ContextSegmentDialogue({
  selectedContext,
  isOpen,
  postDate,
  onClose,
  invalidateQueries,
}: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [splitDate, setSplitDate] = React.useState('');

  useEffect(() => {
    setTitle(selectedContext?.title || '');
    setDetails(selectedContext?.details || '');
    setStartDate(toInputDate(selectedContext?.start_date || postDate));
    setEndDate(toInputDate(selectedContext?.end_date || ''));
    setSplitDate(postDate);
  }, [selectedContext]);

  const refreshContextData = () => {
    queryClient.invalidateQueries({ queryKey: invalidateQueries });
    queryClient.invalidateQueries({ queryKey: ['context_segments', postDate] });
  };

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
      onClose();
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
      onClose();
      refreshContextData();
    },
  });
  const deleteContextMutation = useMutation({
    mutationFn: (id: number) => deleteContextSegment(id),
    onSuccess: () => {
      onClose();
      refreshContextData();
    },
  });
  const createContextMutation = useMutation({
    mutationFn: postContextSegment,
    onSuccess: () => {
      onClose();
      refreshContextData();
    },
  });

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

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
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
          />
          <TextField
            label="End date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <TextField
            label="Split from date"
            type="date"
            size="small"
            value={splitDate}
            onChange={(e) => setSplitDate(e.target.value)}
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
        <Button
          onClick={selectedContext ? handleEditContext : handleCreateContext}
          variant="contained"
          disabled={!title.trim() || !isValidDateRange}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
