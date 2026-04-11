import React from 'react';
import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  body: string;
};

const normalizeParagraphNewlines = (value: string): string => {
  if (!value) {
    return value;
  }

  const lines = value.replace(/\r\n/g, '\n').split('\n');
  const normalized: string[] = [];

  lines.forEach((line, index) => {
    normalized.push(line);

    const isLastLine = index === lines.length - 1;
    const nextLine = lines[index + 1];
    const shouldInsertParagraphBreak =
      !isLastLine && line.trim() !== '' && (nextLine || '').trim() !== '';

    if (shouldInsertParagraphBreak) {
      normalized.push('');
    }
  });

  return normalized.join('\n');
};

const MarkdownRenderer = ({ body }: Props) => {
  const normalizedBody = normalizeParagraphNewlines(body || '');

  return (
    <Box
      sx={{
        '& p': { marginTop: 0, marginBottom: 1.5 },
        '& ul, & ol': { marginTop: 0, marginBottom: 1.5, paddingLeft: 3 },
        '& blockquote': {
          margin: 0,
          paddingLeft: 1.5,
          borderLeft: (theme) => `3px solid ${theme.palette.divider}`,
          color: (theme) => theme.palette.text.secondary,
        },
        '& pre': {
          margin: 0,
          marginBottom: 1.5,
          overflowX: 'auto',
          padding: 1,
          borderRadius: 1,
          backgroundColor: (theme) => theme.palette.action.hover,
        },
        '& code': {
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },
        '& a': {
          color: (theme) => theme.palette.primary.main,
        },
      }}
    >
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener" />
          ),
        }}
      >
        {normalizedBody}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
