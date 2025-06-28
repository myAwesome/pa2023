import React, { FormEvent } from 'react';
import { Button, Grid, LinearProgress, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import PostList from '../PostList/Posts';
import { getLabels, searchPosts } from '../../shared/api/routes';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get('q') || '',
  );
  const [startDate, setStartDate] = React.useState(
    searchParams.get('startDate') || '',
  );
  const [endDate, setEndDate] = React.useState(
    searchParams.get('endDate') || '',
  );
  const [isSearchLoading, setSearchLoading] = React.useState(false);
  const [isSearchSubmitted, setSearchSubmitted] = React.useState(false);
  const [posts, setPosts] = React.useState([]);
  const [page, setPage] = React.useState(Number(searchParams.get('page')) || 1);
  const [pageSize] = React.useState(10); // You can make this adjustable if needed
  const [total, setTotal] = React.useState(0);
  const labelsData = useQuery(['labels'], getLabels);

  // Update URL params when search state changes
  const updateSearchParams = (params: {
    q?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
  }) => {
    const newParams: any = {};
    if (params.q) newParams.q = params.q;
    if (params.startDate) newParams.startDate = params.startDate;
    if (params.endDate) newParams.endDate = params.endDate;
    if (params.page && params.page > 1) newParams.page = params.page;
    setSearchParams(newParams);
  };

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setPage(1); // Reset to first page on new search
    setSearchLoading(true);
    setSearchSubmitted(false);
    updateSearchParams({ q: searchQuery, startDate, endDate, page: 1 });
    searchPosts({
      q: searchQuery,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: 1,
      pageSize,
    })
      .then((response) => {
        if (response?.data) {
          setPosts(response.data.data);
          setTotal(response.data.total || 0);
        }
        setSearchLoading(false);
        setSearchSubmitted(true);
      })
      .catch((err) => {
        setSearchLoading(false);
        setSearchSubmitted(true);
        console.log(err);
      });
  };

  // Handle page change
  React.useEffect(() => {
    if (isSearchSubmitted) {
      setSearchLoading(true);
      updateSearchParams({ q: searchQuery, startDate, endDate, page });
      searchPosts({
        q: searchQuery,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        pageSize,
      })
        .then((response) => {
          if (response?.data) {
            setPosts(response.data.data);
            setTotal(response.data.total || 0);
          }
          setSearchLoading(false);
        })
        .catch((err) => {
          setSearchLoading(false);
          console.log(err);
        });
    }
  }, [page]);

  // On mount, if there are search params, trigger search
  React.useEffect(() => {
    if (
      searchParams.get('q') ||
      searchParams.get('startDate') ||
      searchParams.get('endDate')
    ) {
      setSearchLoading(true);
      setSearchSubmitted(true);
      searchPosts({
        q: searchParams.get('q') || '',
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        page: Number(searchParams.get('page')) || 1,
        pageSize,
      })
        .then((response) => {
          if (response?.data) {
            setPosts(response.data.data);
            setTotal(response.data.total || 0);
          }
          setSearchLoading(false);
        })
        .catch((err) => {
          setSearchLoading(false);
          console.log(err);
        });
    }
  }, []);

  // Pagination helpers
  const totalPages = Math.ceil(total / pageSize);
  // Pagination window logic
  const getPageNumbers = () => {
    const windowSize = 2; // how many pages before/after current
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, page - windowSize);
      const end = Math.min(totalPages - 1, page + windowSize);
      if (start > 2) pages.push('start-ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('end-ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };
  const pageNumbers = getPageNumbers();

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handlePageClick = (pageNum: number) => {
    if (pageNum !== page) setPage(pageNum);
  };

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <form onSubmit={handleSearch}>
          <TextField
            value={searchQuery}
            variant="standard"
            onChange={(e) => setSearchQuery(e.target.value)}
            label="Search"
          />
          <TextField
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            style={{ marginLeft: 8, marginRight: 8 }}
          />
          <TextField
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            label="End Date"
            InputLabelProps={{ shrink: true }}
            style={{ marginLeft: 8, marginRight: 8 }}
          />
          <Button type="submit">search</Button>
        </form>
      </Grid>
      {isSearchSubmitted ? (
        <Grid item>
          <Typography>Found {total} posts</Typography>
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
          invalidateQueries={[]}
        />
      </Grid>
      {isSearchSubmitted && totalPages > 1 && (
        <Grid item>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={1}
            style={{ marginTop: 16 }}
          >
            <Button
              onClick={handlePrevPage}
              disabled={page === 1}
              size="small"
              style={{ marginRight: 8, minWidth: 32 }}
            >
              Prev
            </Button>
            {pageNumbers.map((num, idx) => {
              if (num === 'start-ellipsis' || num === 'end-ellipsis') {
                return (
                  <span
                    key={num + idx}
                    style={{ margin: '0 4px', fontSize: 18 }}
                  >
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={num}
                  onClick={() => handlePageClick(Number(num))}
                  variant={num === page ? 'contained' : 'text'}
                  size="small"
                  style={{
                    margin: '0 2px',
                    minWidth: 32,
                    border: 'none',
                    boxShadow: 'none',
                    background: num === page ? undefined : 'none',
                  }}
                >
                  {num}
                </Button>
              );
            })}
            <Button
              onClick={handleNextPage}
              disabled={page === totalPages}
              size="small"
              style={{ marginLeft: 8, minWidth: 32 }}
            >
              Next
            </Button>
            <span style={{ marginLeft: 16, fontSize: 14 }}>
              Page {page} of {totalPages}
            </span>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default Search;
