import React from 'react';
import { Box, Button } from '@mui/material';

type TextInputRef = HTMLInputElement | HTMLTextAreaElement;

type Props = {
  value: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<TextInputRef | null>;
  isPreview?: boolean;
  onTogglePreview?: () => void;
};

type ApplyResult = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
};

const replaceSelection = (
  value: string,
  inputRef: React.RefObject<TextInputRef | null>,
  onChange: (next: string) => void,
  apply: (selectedText: string) => ApplyResult,
) => {
  const input = inputRef.current;
  const start = input?.selectionStart ?? value.length;
  const end = input?.selectionEnd ?? value.length;
  const selectedText = value.slice(start, end);
  const nextText = apply(selectedText);
  const nextValue = `${value.slice(0, start)}${nextText.text}${value.slice(end)}`;
  onChange(nextValue);

  if (!input) {
    return;
  }

  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(
      start + nextText.selectionStart,
      start + nextText.selectionEnd,
    );
  });
};

const linePrefix = (selectedText: string, prefix: string) => {
  if (!selectedText) {
    return `${prefix}text`;
  }
  return selectedText
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
};

const MarkdownToolbar = ({
  value,
  onChange,
  inputRef,
  isPreview = false,
  onTogglePreview,
}: Props) => {
  const buttons = [
    {
      label: 'H1',
      onClick: () =>
        replaceSelection(value, inputRef, onChange, (selectedText) => {
          const text = `# ${selectedText || 'Heading'}`;
          const cursorPos = selectedText ? text.length : 2;
          return {
            text,
            selectionStart: cursorPos,
            selectionEnd: text.length,
          };
        }),
    },
    {
      label: 'H2',
      onClick: () =>
        replaceSelection(value, inputRef, onChange, (selectedText) => {
          const text = `## ${selectedText || 'Heading'}`;
          const cursorPos = selectedText ? text.length : 3;
          return {
            text,
            selectionStart: cursorPos,
            selectionEnd: text.length,
          };
        }),
    },
    {
      label: 'b',
      onClick: () =>
        replaceSelection(value, inputRef, onChange, (selectedText) => {
          const fallback = 'bold text';
          const content = selectedText || fallback;
          const text = `**${content}**`;
          const start = 2;
          return {
            text,
            selectionStart: start,
            selectionEnd: start + content.length,
          };
        }),
    },
    {
      label: 'i',
      onClick: () =>
        replaceSelection(value, inputRef, onChange, (selectedText) => {
          const fallback = 'italic text';
          const content = selectedText || fallback;
          const text = `*${content}*`;
          const start = 1;
          return {
            text,
            selectionStart: start,
            selectionEnd: start + content.length,
          };
        }),
    },
    {
      label: 's',
      onClick: () =>
        replaceSelection(value, inputRef, onChange, (selectedText) => {
          const fallback = 'strikethrough';
          const content = selectedText || fallback;
          const text = `~~${content}~~`;
          return {
            text,
            selectionStart: 2,
            selectionEnd: 2 + content.length,
          };
        }),
    },
    {
      label: 'List',
      onClick: () =>
        replaceSelection(value, inputRef, onChange, (selectedText) => {
          const text = selectedText ? linePrefix(selectedText, '- ') : '- ';
          const cursorPos = text.length;
          return {
            text,
            selectionStart: cursorPos,
            selectionEnd: cursorPos,
          };
        }),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        marginTop: 1,
        marginBottom: 1.5,
        justifyContent: 'flex-start',
      }}
    >
      {buttons.map((button) => (
        <Button
          key={button.label}
          type="button"
          size="small"
          color="inherit"
          variant="outlined"
          onClick={button.onClick}
          sx={{ minWidth: 0, textTransform: 'none' }}
        >
          {button.label}
        </Button>
      ))}
      {onTogglePreview ? (
        <Button
          type="button"
          size="small"
          color="inherit"
          variant={isPreview ? 'contained' : 'outlined'}
          onClick={onTogglePreview}
          sx={{ minWidth: 0, textTransform: 'none' }}
        >
          {isPreview ? 'edit' : 'preview'}
        </Button>
      ) : null}
    </Box>
  );
};

export default MarkdownToolbar;
