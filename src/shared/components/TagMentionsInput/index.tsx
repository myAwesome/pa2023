import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTags, postTag } from '../../api/routes';
import { TagType } from '../../types';

type MentionMatch = {
  start: number;
  end: number;
  query: string;
};

type Option = {
  type: 'tag' | 'create';
  name: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  inputRef: React.MutableRefObject<
    HTMLTextAreaElement | HTMLInputElement | null
  >;
  variant: 'standard' | 'outlined' | 'filled';
  rows?: number;
  disabled?: boolean;
};

const normalizeTagName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');

const getMentionMatch = (text: string, cursor: number): MentionMatch | null => {
  const beforeCursor = text.slice(0, cursor);
  const match = beforeCursor.match(/(^|\s)@([a-zA-Z0-9_-]*)$/);
  if (!match) {
    return null;
  }

  const query = match[2] || '';
  return {
    start: cursor - query.length - 1,
    end: cursor,
    query,
  };
};

const TagMentionsInput = ({
  value,
  onChange,
  inputRef,
  variant,
  rows = 4,
  disabled = false,
}: Props) => {
  const queryClient = useQueryClient();
  const [mention, setMention] = React.useState<MentionMatch | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  });
  const createTagMutation = useMutation({
    mutationFn: postTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const tags = Array.isArray(tagsQuery.data)
    ? (tagsQuery.data as TagType[])
    : [];
  const normalizedQuery = normalizeTagName(mention?.query || '');
  const filteredTags = React.useMemo(
    () =>
      mention
        ? tags
            .filter((tag) =>
              tag.name
                .toLowerCase()
                .includes((mention.query || '').trim().toLowerCase()),
            )
            .slice(0, 6)
        : [],
    [mention, tags],
  );

  const options: Option[] = React.useMemo(() => {
    if (!mention) {
      return [];
    }
    const existingOptions = filteredTags.map((tag) => ({
      type: 'tag' as const,
      name: tag.name,
      label: `@${tag.name}`,
    }));
    const hasExactMatch = tags.some((tag) => tag.name === normalizedQuery);

    if (!normalizedQuery || hasExactMatch) {
      return existingOptions;
    }

    return [
      ...existingOptions,
      {
        type: 'create' as const,
        name: normalizedQuery,
        label: `Create @${normalizedQuery}`,
      },
    ];
  }, [mention, filteredTags, normalizedQuery, tags]);

  React.useEffect(() => {
    if (options.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= options.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, options.length]);

  const updateMentionState = React.useCallback(
    (nextValue: string, cursor: number) => {
      const match = getMentionMatch(nextValue, cursor);
      setMention(match);
      setActiveIndex(0);
    },
    [],
  );

  const restoreCursor = (nextValue: string, cursorPosition: number) => {
    onChange(nextValue);
    requestAnimationFrame(() => {
      if (!inputRef.current) {
        return;
      }
      inputRef.current.focus();
      if ('setSelectionRange' in inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
      updateMentionState(nextValue, cursorPosition);
    });
  };

  const applyTag = React.useCallback(
    async (option: Option) => {
      if (!mention) {
        return;
      }

      let tagName = option.name;
      if (option.type === 'create') {
        const created = await createTagMutation.mutateAsync({
          name: option.name,
        });
        tagName = (created as TagType)?.name || option.name;
      }

      const before = value.slice(0, mention.start);
      const after = value.slice(mention.end);
      const nextValue = `${before}@${tagName} ${after}`;
      const cursor = before.length + tagName.length + 2;
      restoreCursor(nextValue, cursor);
    },
    [createTagMutation, mention, onChange, value],
  );

  const syncMentionFromInput = () => {
    if (!inputRef.current) {
      return;
    }
    const cursor = inputRef.current.selectionStart ?? value.length;
    updateMentionState(value, cursor);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    onChange(nextValue);
    updateMentionState(nextValue, e.target.selectionStart ?? nextValue.length);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mention || options.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % options.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setMention(null);
      return;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      await applyTag(options[activeIndex]);
    }
  };

  const showSuggestions = !!mention && options.length > 0 && !disabled;

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        multiline
        fullWidth
        rows={rows}
        variant={variant}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={syncMentionFromInput}
        onClick={syncMentionFromInput}
        inputRef={inputRef}
        disabled={disabled}
      />
      {showSuggestions ? (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            mt: 0.5,
            zIndex: 10,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          <List dense disablePadding>
            {options.map((option, index) => (
              <ListItemButton
                key={`${option.type}-${option.name}`}
                selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  applyTag(option);
                }}
              >
                <ListItemText primary={option.label} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : null}
    </Box>
  );
};

export default TagMentionsInput;
