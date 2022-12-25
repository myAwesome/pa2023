import React from 'react';
import { Box } from '@mui/material';

const PostComment = ({ comment }) => {
  return (
    <Box
      sx={{
        color: (theme) => theme.palette.primary.light,
        paddingLeft: 10,
      }}
    >
      <Box
        className={{
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
