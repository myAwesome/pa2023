import React from 'react';
import Grid from '@mui/material/GridLegacy';
import { QueryKey } from '@tanstack/react-query';
import PostShow from '../../PostShow';
import { LabelType, PostType } from '../../../shared/types';

type Props = {
  labels: LabelType[];
  posts: PostType[];
  searchTerm?: string;
  invalidateQueries: QueryKey;
};

const Posts = ({ labels, posts, searchTerm, invalidateQueries }: Props) => {
  const safePosts = Array.isArray(posts) ? posts : [];
  return (
    <Grid container direction="column" spacing={4}>
      {safePosts.map((p) => (
        <Grid key={p.id}>
          <PostShow
            post={{ ...p, labels: p.labels || [] }}
            labels={labels}
            searchTerm={searchTerm}
            invalidateQueries={invalidateQueries}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Posts;
