import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

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

type ToolbarButton = {
  key: string;
  label: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
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

const MarkdownToolbar = ({
  value,
  onChange,
  inputRef,
  isPreview = false,
  onTogglePreview,
}: Props) => {
  const buttons: ToolbarButton[] = [
    {
      key: 'h1',
      label: <strong>H1</strong>,
      ariaLabel: 'Heading 1',
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
      key: 'h2',
      label: <strong>H2</strong>,
      ariaLabel: 'Heading 2',
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
      key: 'bold',
      label: <strong>b</strong>,
      ariaLabel: 'Bold',
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
      key: 'italic',
      label: <em>i</em>,
      ariaLabel: 'Italic',
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
      key: 'strike',
      label: <s>s</s>,
      ariaLabel: 'Strikethrough',
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
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: 1,
        marginBottom: 1.5,
        justifyContent: 'flex-start',
      }}
    >
      <ButtonGroup
        size="small"
        variant="outlined"
        color="inherit"
        sx={{
          '& .MuiButton-root': {
            minWidth: 34,
            textTransform: 'none',
            borderColor: (theme) => theme.palette.divider,
            color: (theme) => theme.palette.text.primary,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.grey[50],
          },
          '& .MuiButton-root:hover': {
            backgroundColor: (theme) => theme.palette.action.hover,
            borderColor: (theme) => theme.palette.divider,
          },
        }}
      >
        {buttons.map((button) => (
          <Button
            key={button.key}
            type="button"
            onClick={button.onClick}
            aria-label={button.ariaLabel}
            title={button.ariaLabel}
          >
            {button.label}
          </Button>
        ))}
        {onTogglePreview ? (
          <Button
            type="button"
            onClick={onTogglePreview}
            aria-label={isPreview ? 'Edit mode' : 'Preview mode'}
            title={isPreview ? 'Edit mode' : 'Preview mode'}
          >
            {isPreview ? (
              <EditOutlinedIcon fontSize="small" />
            ) : (
              <VisibilityOutlinedIcon fontSize="small" />
            )}
          </Button>
        ) : null}
      </ButtonGroup>
    </Box>
  );
};

export default MarkdownToolbar;
