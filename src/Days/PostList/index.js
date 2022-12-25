import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLabels, getPosts, getPostsHistory } from '../../shared/api/routes';
import Posts from './Posts';

const PostList = ({ tab }) => {
  const { data, isLoading } = useQuery(
    [tab === 'history' ? 'history_posts' : 'recent_posts'],
    tab === 'history' ? getPostsHistory : getPosts,
  );
  const labelsData = useQuery(['labels'], getLabels);
  return isLoading ? (
    'Loading...'
  ) : (
    <Posts
      posts={data}
      labels={labelsData.data || []}
      invalidateQueries={[tab === 'history' ? 'history_posts' : 'recent_posts']}
    />
  );
};

export default PostList;
