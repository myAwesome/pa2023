import React from 'react';
import {
  IconButton,
  List,
  ListItemButton,
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
import { ProjectType } from '../shared/types';
import AddProject from './AddProject';

const Projects = () => {
  const [projectToEdit, setProjectToEdit] = React.useState<ProjectType | null>(
    null,
  );
  const [isAdd, setIsAdd] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const navigate = useNavigate();
  const projectsData = useQuery(['projects'], getProjects);
  const addMutation = useCreateMutation(
    (values: ProjectType) => postProject(values),
    ['projects'],
    (old: ProjectType[], values: ProjectType) => [values, ...old],
    () => {
      setIsAdd(false);
    },
  );
  const editMutation = useUpdateMutation(
    (values: ProjectType) => putProject(projectToEdit?.id, values),
    ['projects'],
    projectToEdit?.id,
    (values: ProjectType) => values,
    () => {
      setIsEdit(false);
      setProjectToEdit(null);
    },
    ['project', projectToEdit?.id],
  );

  const handleSubmit = (values: Omit<ProjectType, 'id' | 'created_at'>) => {
    if (isAdd) {
      // @ts-ignore
      addMutation.mutate(values);
    } else {
      // @ts-ignore
      editMutation.mutate(values);
    }
  };

  const handleEditClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    project: ProjectType,
  ) => {
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
          {projectsData.data?.map((list: ProjectType) => (
            <ListItemButton
              key={list.id}
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
            </ListItemButton>
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