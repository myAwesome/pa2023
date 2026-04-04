import React from 'react';
import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  body: string;
};

const MarkdownRenderer = ({ body }: Props) => {
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
        {body || ''}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
