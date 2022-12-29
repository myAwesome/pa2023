import React from 'react';
import { Box } from '@mui/material';
import { CommentType } from '../../../shared/types';

type Props = {
  comment: CommentType;
};

const PostComment = ({ comment }: Props) => {
  return (
    <Box
      sx={{
        color: (theme) => theme.palette.primary.light,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          color: (theme) => theme.palette.secondary.light,
        }}
      >
        {comment.date.slice(0, 10)}
      </Box>
      <span> {comment.body}</span>
    </Box>
  );
};

export default PostComment;
