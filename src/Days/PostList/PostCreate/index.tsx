import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useQuery } from '@tanstack/react-query';
import { getContextSegments, postPost } from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { ContextSegmentType } from '../../../shared/types';
import { dateToMySQLFormat } from '../../../shared/utils/mappers';
import MarkdownToolbar from '../../../shared/components/MarkdownToolbar';
import MarkdownRenderer from '../../../shared/components/MarkdownRenderer';
import TagMentionsInput from '../../../shared/components/TagMentionsInput';
import { ContextSegmentDialogue } from '../../PostShow/ContextSegmentDialogue';

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
  const [value, setValue] = React.useState('');
  const [isPreview, setIsPreview] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement | HTMLInputElement | null>(
    null,
  );
  const [date, setDate] = React.useState(today);
  const [isAddContextOpen, setAddContextOpen] = React.useState(false);
  const [selectedContext, setSelectedContext] =
    React.useState<ContextSegmentType | null>(null);
  const contextQuery = useQuery({
    queryKey: ['context_segments', date],
    queryFn: () => getContextSegments({ date }),
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
      setIsPreview(false);
    },
  );

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = () => {
    if (value) {
      createPostMutation.mutate(createPost(value, date));
    }
  };

  const openContextDialog = (segment: ContextSegmentType) => {
    setSelectedContext(segment);
  };

  const appliedContext = normalizeSegments(contextQuery.data);

  return (
    <form style={{ marginBottom: '30px', textAlign: 'center' }}>
      {isPreview ? (
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            minHeight: 120,
            textAlign: 'left',
            padding: 1.5,
          }}
        >
          <MarkdownRenderer body={value} />
        </Box>
      ) : (
        <TagMentionsInput
          value={value}
          onChange={setValue}
          inputRef={inputRef}
          rows={4}
          variant="outlined"
        />
      )}
      <MarkdownToolbar
        value={value}
        onChange={setValue}
        inputRef={inputRef}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview((prev) => !prev)}
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
      <ContextSegmentDialogue
        isOpen={!!selectedContext || isAddContextOpen}
        selectedContext={selectedContext}
        onClose={() => {
          setSelectedContext(null);
          setAddContextOpen(false);
        }}
        invalidateQueries={['context_segments', date]}
        postDate={toInputDate(date)}
      />
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
