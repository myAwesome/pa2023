import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getInProgress } from '../../shared/api/routes';
import { TaskType } from '../../shared/types';

const TasksInProgress = () => {
  const inProgressData = useQuery({
    queryKey: ['in_progress'],
    queryFn: () => getInProgress(),
  });
  const navigate = useNavigate();

  return inProgressData.data?.length > 0 ? (
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <Grid container>
        {inProgressData.data.map((task: TaskType) => (
          <Grid item key={task.id}>
            <Typography
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
    </Box>
  ) : null;
};

export default TasksInProgress;
