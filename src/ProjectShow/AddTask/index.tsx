import React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useCreateMutation } from '../../shared/hooks/useCreateMutation';
import { postTask } from '../../shared/api/routes';
import { TasksByStatus, TaskType } from '../../shared/types';

const AddTask = () => {
  const params = useParams();
  const [newTaskName, setNewTaskName] = React.useState('');
  const createMutation = useCreateMutation(
    (data: TaskType) => postTask(data),
    ['tasks', params.id],
    (old: TasksByStatus, payload: TaskType) => ({
      ...old,
      incoming: [{ ...payload, id: 'new' }, ...old.incoming],
    }),
    () => {
      setNewTaskName('');
    },
  );
  return (
    <Box
      component="form"
      sx={{
        marginTop: (theme) => theme.spacing(2),
        marginBottom: (theme) => theme.spacing(2),
      }}
      onSubmit={(e) => {
        e.preventDefault();
        // @ts-ignore
        createMutation.mutate({
          body: newTaskName,
          project_id: Number(params.id),
          status: 'incoming',
        });
      }}
    >
      <Grid container spacing={1}>
        <Grid item>
          <TextField
            name="time"
            type="text"
            variant="standard"
            value={newTaskName}
            onChange={(e) => {
              setNewTaskName(e.target.value);
            }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="small"
            type="submit"
          >
            add
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddTask;
