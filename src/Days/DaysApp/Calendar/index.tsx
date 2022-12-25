import React from 'react';
import moment from 'moment';
import { Typography } from '@mui/material';
import Table from '../../../shared/components/Table';
import { getCalendar } from '../../../shared/utils/calendar';
import { LabelType, PostType } from '../../../shared/types';
import CalendarCell from './Cell';

type Props = {
  year: string;
  month: string;
  posts: PostType[];
};

const columns = [
  { title: 'Mon', field: 0, render: CalendarCell },
  { title: 'Tue', field: 1, render: CalendarCell },
  { title: 'Wed', field: 2, render: CalendarCell },
  { title: 'Thu', field: 3, render: CalendarCell },
  { title: 'Fri', field: 4, render: CalendarCell },
  { title: 'Sat', field: 5, render: CalendarCell },
  { title: 'Sun', field: 6, render: CalendarCell },
];

const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;

const Calendar = ({ year, month, posts }: Props) => {
  const [data, setData] = React.useState<
    { labels?: LabelType[]; isEmpty: boolean; date?: number }[][]
  >([]);

  React.useEffect(() => {
    const calendar = getCalendar(month || thisMonth, year || thisYear);
    const dataToSet = calendar.map((week) => {
      return week.map((d) => {
        const post = posts.find(
          (post) => moment(post?.date).format('D') === d?.date?.toString(),
        );
        return { ...d, ...post, labels: post?.labels, isEmpty: !post };
      });
    });
    setData(dataToSet);
  }, [year, month, posts]);

  return (
    <div>
      <Typography variant="h6">
        {year || thisYear}-{month || thisMonth}
      </Typography>
      <Table columns={columns} data={data} size="small" />
    </div>
  );
};

export default Calendar;
