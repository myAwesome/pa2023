import React from 'react';
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Hidden,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { getProjects, postProject, putProject } from '../shared/api/routes';
import { useCreateMutation } from '../shared/hooks/useCreateMutation';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import AddProject from './AddProject';

const Projects = () => {
  const [projectToEdit, setProjectToEdit] = React.useState(null);
  const [isAdd, setIsAdd] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const navigate = useNavigate();
  const projectsData = useQuery(['projects'], getProjects);
  const addMutation = useCreateMutation(
    (values) => postProject(values),
    ['projects'],
    (old, values) => [values, ...old],
    () => {
      setIsAdd(false);
    },
  );
  const editMutation = useUpdateMutation(
    (values) => putProject(projectToEdit?.id, values),
    ['projects'],
    projectToEdit?.id,
    (values) => values,
    () => {
      setIsEdit(false);
      setProjectToEdit(null);
    },
    ['project', projectToEdit?.id],
  );

  const handleSubmit = (values) => {
    if (isAdd) {
      addMutation.mutate(values);
    } else {
      editMutation.mutate(values);
    }
  };

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setIsEdit(true);
    setIsAdd(false);
    setProjectToEdit(project);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setIsAdd(true);
    setProjectToEdit(null);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setIsEdit(false);
    setProjectToEdit(null);
  };

  return (
    <div>
      <h1>Projects</h1>
      {projectsData.isLoading ? (
        <div>Loading...</div>
      ) : (
        <List>
          {projectsData.data?.map((list) => (
            <ListItem
              key={list.id}
              button
              onClick={() => navigate(`/projects/${list.id}`)}
            >
              <ListItemText primary={list.title} />
              <Hidden smDown>
                <ListItemText secondary={list.description} />
              </Hidden>
              <ListItemIcon>
                <IconButton onClick={(e) => handleEditClick(e, list)}>
                  <EditIcon />
                </IconButton>
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      )}
      <IconButton onClick={handleAdd}>
        <AddIcon />
      </IconButton>
      {isAdd || isEdit ? (
        <AddProject
          handleSubmit={handleSubmit}
          initialValues={projectToEdit}
          handleCancel={handleCancel}
        />
      ) : null}
    </div>
  );
};

export default Projects;
