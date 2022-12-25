import React from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import PostShow from '../../PostShow';

const Posts = ({ labels, posts, searchTerm, invalidateQueries }) => {
  const oauthToken = useSelector((state) => state.photos.token);
  return (
    <Grid container direction="column" spacing={4}>
      {posts.map((p) => (
        <Grid item key={p.id}>
          <PostShow
            post={{ ...p, labels: p.labels || [] }}
            labels={labels}
            searchTerm={searchTerm}
            oauthToken={oauthToken}
            invalidateQueries={invalidateQueries}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Posts;
