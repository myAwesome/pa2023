import React from 'react';
import { Badge, Grid, Hidden } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { getExpiredLts } from '../../shared/api/routes';
import { LastTimeItemType } from '../../shared/types';

const Reminder = () => {
  const reminderData = useQuery(['expired_last_times'], () => getExpiredLts());
  const navigate = useNavigate();

  return reminderData.data?.length > 0 ? (
    <>
      <Hidden smUp>
        <Badge
          color="error"
          badgeContent={reminderData.data.length}
          onClick={() => navigate('/last-time')}
        >
          <Notifications />
        </Badge>
      </Hidden>
      <Hidden smDown>
        <Grid container>
          {reminderData.data.map((lt: LastTimeItemType) => (
            <Grid item key={lt.id}>
              <b> !!! {lt.body} !!! </b>
            </Grid>
          ))}
        </Grid>
      </Hidden>
    </>
  ) : null;
};

export default Reminder;
