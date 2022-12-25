import React from 'react';
import { Button, Grid, LinearProgress, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Typography from '@mui/material/Typography';
import PostList from '../PostList/Posts';
import { getLabels, searchPosts } from '../../shared/api/routes';
import { mapPost } from '../../shared/utils/mappers';

const Search = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchLoading, setSearchLoading] = React.useState(false);
  const [isSearchSubmitted, setSearchSubmitted] = React.useState(false);
  const [posts, setPosts] = React.useState([]);
  const labelsData = useQuery(['labels'], getLabels);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchSubmitted(false);
    searchPosts(searchQuery)
      .then((response) => {
        const newPosts = response.data.map(mapPost);

        setPosts(newPosts);
        setSearchLoading(false);
        setSearchSubmitted(true);
      })
      .catch(console.log);
  };
  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <form onSubmit={handleSearch}>
          <TextField
            value={searchQuery}
            variant="standard"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">search</Button>
        </form>
      </Grid>
      {isSearchSubmitted ? (
        <Grid item>
          <Typography>Found {posts.length} posts</Typography>
        </Grid>
      ) : isSearchLoading ? (
        <Grid item>
          <LinearProgress />
        </Grid>
      ) : null}
      <Grid item>
        <PostList
          labels={labelsData.data || []}
          posts={posts}
          searchTerm={searchQuery}
        />
      </Grid>
    </Grid>
  );
};

export default Search;
