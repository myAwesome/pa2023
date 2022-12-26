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
        paddingLeft: 10,
      }}
    >
      <Box
        sx={{
          color: (theme) => theme.palette.secondary.light,
        }}
      >
        {comment.Date.substr(0, 10)}
      </Box>
      <span> {comment.Body}</span>
    </Box>
  );
};

export default PostComment;
