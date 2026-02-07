import React from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Typography } from '@mui/material';
import {
  getLabels,
  getPosts,
  getPostsHistoryByDate,
} from '../../shared/api/routes';
import Posts from './Posts';
import HistoryDateSelector from './HistoryDateSelector';

type Props = {
  tab: 'history' | 'last';
};

const PostList = ({ tab }: Props) => {
  const [selectedDate, setSelectedDate] = React.useState(
    dayjs().format('YYYY-MM-DD'),
  );
  const md = dayjs(selectedDate).format('MM-DD');

  const { data, isLoading } = useQuery(
    [tab === 'history' ? 'history_posts' : 'recent_posts', tab === 'history' ? md : undefined],
    tab === 'history' ? () => getPostsHistoryByDate(md) : getPosts,
  );
  const labelsData = useQuery(['labels'], getLabels);

  return (
    <>
      {tab === 'history' && (
        <HistoryDateSelector date={selectedDate} onChange={setSelectedDate} />
      )}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Posts
          posts={data}
          labels={labelsData.data || []}
          invalidateQueries={[
            tab === 'history' ? 'history_posts' : 'recent_posts',
            tab === 'history' ? md : undefined,
          ]}
        />
      )}
    </>
  );
};

export default PostList;
