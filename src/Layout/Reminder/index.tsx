import React from 'react';
import { Badge, Box } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Notifications } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getExpiredLts } from '../../shared/api/routes';
import { LastTimeItemType } from '../../shared/types';

const Reminder = () => {
  const reminderData = useQuery({
    queryKey: ['expired_last_times'],
    queryFn: () => getExpiredLts(),
  });
  const navigate = useNavigate();

  return reminderData.data?.length > 0 ? (
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Badge
          color="error"
          badgeContent={reminderData.data.length}
          onClick={() => navigate('/last-time')}
        >
          <Notifications />
        </Badge>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Grid container>
          {reminderData.data.map((lt: LastTimeItemType) => (
            <Grid key={lt.id}>
              <b> !!! {lt.body} !!! </b>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  ) : null;
};

export default Reminder;
