import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography } from '@mui/material';
import { getLabels, getPosts, getPostsHistory } from '../../shared/api/routes';
import Posts from './Posts';

type Props = {
  tab: 'history' | 'last';
};

const PostList = ({ tab }: Props) => {
  const { data, isLoading } = useQuery(
    [tab === 'history' ? 'history_posts' : 'recent_posts'],
    tab === 'history' ? getPostsHistory : getPosts,
  );
  const labelsData = useQuery(['labels'], getLabels);
  return isLoading ? (
    <Typography>Loading...</Typography>
  ) : (
    <Posts
      posts={data}
      labels={labelsData.data || []}
      invalidateQueries={[tab === 'history' ? 'history_posts' : 'recent_posts']}
    />
  );
};

export default PostList;
