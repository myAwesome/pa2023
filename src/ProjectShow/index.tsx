import React, { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Box, ListItem, Menu, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckSharp from '@mui/icons-material/CheckSharp';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { useParams } from 'react-router-dom';
import {
  deleteTask,
  editTask,
  getProject,
  getTasks,
} from '../shared/api/routes';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../shared/hooks/useDeleteMutation';
import { TasksByStatus, TaskStatus, TaskType } from '../shared/types';
import AddTIL from './AddTIL';
import AddTask from './AddTask';

const Project = () => {
  const params = useParams();
  const [menuAnchorElement, setMenuAnchorElement] =
    React.useState<HTMLButtonElement | null>(null);
  const [pressedTask, setPressedTask] = React.useState<TaskType | null>(null);
  const [editedTask, setEditedTask] = React.useState<TaskType | null>(null);
  const [editedTaskValue, setEditedTaskValue] = React.useState<string | null>(
    null,
  );
  const [taskForModal, setTaskForModal] = React.useState<TaskType | null>(null);
  const projectData = useQuery(['project', params.id], () =>
    getProject(params.id),
  );
  const tasksData = useQuery(['tasks', params.id], () => getTasks(params.id));
  const editMutation = useUpdateMutation(
    ({ id, ...values }: TaskType) => editTask(id, values),
    ['tasks', params.id],
    null,
    (val: TaskType) => val,
    () => {
      setEditedTask(null);
      setEditedTaskValue(null);
    },
    ['in_progress'],
    (old: TasksByStatus, payload: TaskType) => {
      const entries = Object.entries(old);
      let taskIndex;
      let status: TaskStatus | undefined;
      for (let i = 0; i < entries.length; i++) {
        const [key, values] = entries[i];
        taskIndex = values.findIndex((t) => t.id === payload.id);
        if (taskIndex >= 0) {
          status = key as TaskStatus;
          break;
        }
      }
      if (status && taskIndex && taskIndex >= 0) {
        if (payload.archived) {
          old[status] = old[status].filter((t) => t.id !== payload.id);
        } else if (payload.status && payload.status !== status) {
          old[payload.status] = [
            ...old[payload.status],
            { ...old[status][taskIndex], ...payload },
          ];
          old[status] = old[status].filter((t) => t.id !== payload.id);
        } else {
          old[status][taskIndex] = { ...old[status][taskIndex], ...payload };
        }
      }
    },
  );
  const deleteMutation = useDeleteMutation(
    (id: string) => deleteTask(id),
    ['tasks', params.id],
    null,
    () => {},
    ['in_progress'],
    (old: TasksByStatus, id: string) => {
      Object.keys(old).forEach((key) => {
        old[key as TaskStatus] = old[key as TaskStatus].filter(
          (t) => t.id !== id,
        );
      });
    },
  );

  const handleMenuClose = () => {
    setPressedTask(null);
    setMenuAnchorElement(null);
  };

  const handleMoreClick = (task: TaskType, element: HTMLButtonElement) => {
    setPressedTask(task);
    setMenuAnchorElement(element);
  };

  const handleStatusChange = (task: TaskType, status: TaskStatus) => {
    handleMenuClose();
    // @ts-ignore
    editMutation.mutate({ id: task.id, status });
  };

  const handleEdit = (task: TaskType) => {
    handleMenuClose();
    setEditedTask(task);
    setEditedTaskValue(task.body);
  };

  const handleArchive = (task: TaskType) => {
    handleMenuClose();
    // @ts-ignore
    editMutation.mutate({ id: task.id, archived: true });
  };

  const handleDelete = (task: TaskType) => {
    handleMenuClose();
    // @ts-ignore
    deleteMutation.mutate(task.id);
  };

  const handleChangePriority = (task: TaskType, increment: number) => {
    handleMenuClose();
    // @ts-ignore
    editMutation.mutate({ id: task.id, priority: task.priority + increment });
  };

  const handleOpenTILModal = (task: TaskType) => {
    handleMenuClose();
    setTaskForModal(task);
  };

  const handleCloseTILModal = () => {
    setTaskForModal(null);
  };

  const handleChangeTask = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedTaskValue(e.target.value);
  };

  const handleSubmitTaskEdit = () => {
    // @ts-ignore
    editMutation.mutate({ id: editedTask.id, body: editedTaskValue });
  };

  return projectData.isLoading ? (
    <Typography>Loading...</Typography>
  ) : (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Box>
        <Typography variant="h4"> {projectData.data.title} </Typography>
        <Typography variant="subtitle2">
          {' '}
          {projectData.data.description}{' '}
        </Typography>
      </Box>
      <AddTask />

      <Grid item xs={12} container spacing={1}>
        {Object.keys(tasksData.data || {}).map((key) => (
          <Grid
            item
            sm={3}
            xs={12}
            container
            direction="column"
            spacing={1}
            key={key}
          >
            <Grid item>
              <Paper
                sx={{
                  position: 'relative',
                  padding: (theme) => theme.spacing(2),
                  textAlign: 'left',
                  color: (theme) => theme.palette.text.secondary,
                  wordBreak: 'break-word',
                  '@media screen and (min-width: 600px) and (max-width: 700px)':
                    {
                      padding: (theme) => theme.spacing(1),
                    },
                }}
              >
                <Typography color="primary"> {key} </Typography>
              </Paper>
            </Grid>
            {tasksData.data?.[key as TaskStatus].map((task) => (
              <Grid item key={task.id}>
                <Paper
                  sx={{
                    position: 'relative',
                    padding: (theme) => theme.spacing(2),
                    textAlign: 'left',
                    color: (theme) => theme.palette.text.secondary,
                    wordBreak: 'break-word',
                    '@media screen and (min-width: 600px) and (max-width: 700px)':
                      {
                        padding: (theme) => theme.spacing(1),
                      },
                  }}
                >
                  {editedTask?.id === task.id ? (
                    <>
                      <IconButton
                        onClick={handleSubmitTaskEdit}
                        sx={{
                          padding: (theme) => theme.spacing(0.5),
                          position: 'absolute',
                          bottom: 8,
                          right: 0,
                          '@media screen and (min-width: 600px) and (max-width: 700px)':
                            {
                              bottom: 2,
                            },
                        }}
                      >
                        <CheckSharp />
                      </IconButton>
                      <TextField
                        variant="standard"
                        value={editedTaskValue}
                        onChange={handleChangeTask}
                      />
                    </>
                  ) : (
                    <>
                      <Typography
                        sx={{
                          marginRight: 2.5,
                        }}
                      >
                        {task.body}
                      </Typography>
                      <IconButton
                        onClick={(event) =>
                          handleMoreClick(task, event.currentTarget)
                        }
                        sx={{
                          padding: (theme) => theme.spacing(0.5),
                          position: 'absolute',
                          bottom: 8,
                          right: 0,
                          '@media screen and (min-width: 600px) and (max-width: 700px)':
                            {
                              bottom: 2,
                            },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      <Menu
        anchorEl={menuAnchorElement}
        open={Boolean(menuAnchorElement)}
        onClose={handleMenuClose}
      >
        <ListItem onClick={() => handleOpenTILModal(pressedTask!)}>
          Today I learned
        </ListItem>
        <Divider />
        <ListItem onClick={() => handleChangePriority(pressedTask!, 1)}>
          Up priority
        </ListItem>
        <ListItem onClick={() => handleChangePriority(pressedTask!, -1)}>
          Down priority
        </ListItem>
        <Divider />
        <ListItem
          onClick={() => handleStatusChange(pressedTask!, TaskStatus.INCOMING)}
        >
          Incoming
        </ListItem>
        <ListItem
          onClick={() => handleStatusChange(pressedTask!, TaskStatus.TODO)}
        >
          Todo
        </ListItem>
        <ListItem
          onClick={() =>
            handleStatusChange(pressedTask!, TaskStatus.IN_PROGRESS)
          }
        >
          InProgress
        </ListItem>
        <ListItem
          onClick={() => handleStatusChange(pressedTask!, TaskStatus.DONE)}
        >
          Done
        </ListItem>
        <Divider />
        <ListItem onClick={() => handleEdit(pressedTask!)}>Edit</ListItem>
        <ListItem onClick={() => handleArchive(pressedTask!)}>Archive</ListItem>
        <ListItem onClick={() => handleDelete(pressedTask!)}>Delete</ListItem>
      </Menu>
      <AddTIL
        isOpen={Boolean(taskForModal)}
        handleClose={handleCloseTILModal}
        task={taskForModal}
        projectId={params.id || ''}
      />
    </Box>
  );
};

export default Project;
