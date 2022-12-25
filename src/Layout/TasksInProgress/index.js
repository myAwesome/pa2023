import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';
import { Grid, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getInProgress } from '../../shared/api/routes';

const TasksInProgress = () => {
  const inProgressData = useQuery(['in_progress'], () => getInProgress());
  const navigate = useNavigate();

  return inProgressData.data?.length > 0 ? (
    <Grid container>
      {inProgressData.data.map((task) => (
        <Grid item key={task.id}>
          <Typography
            variant="b"
            sx={{
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/projects/${task.project_id}`)}
          >
            --- {task.body} ---
          </Typography>
        </Grid>
      ))}
    </Grid>
  ) : null;
};

TasksInProgress.propTypes = {
  inProgress: PropTypes.array,
};

export default TasksInProgress;
