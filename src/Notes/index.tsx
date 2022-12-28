import React from 'react';
import {
  IconButton,
  List,
  ListItemText,
  ListItemIcon,
  Dialog,
  useMediaQuery,
  useTheme,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  ListItemButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  deleteNoteCategory,
  getNoteCategories,
  postNoteCategory,
  putNoteCategory,
} from '../shared/api/routes';
import { useCreateMutation } from '../shared/hooks/useCreateMutation';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../shared/hooks/useDeleteMutation';
import { NoteCategoryType } from '../shared/types';
import AddNoteCategory from './AddNoteCategory';

const NoteCategories = () => {
  const [isAdd, setIsAdd] = React.useState(false);
  const [noteCategoryToEdit, setNoteCategoryToEdit] =
    React.useState<NoteCategoryType | null>(null);
  const [noteCategoryToDelete, setNoteCategoryToDelete] =
    React.useState<NoteCategoryType | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const noteCategoriesData = useQuery(['note_categories'], getNoteCategories);
  const addMutation = useCreateMutation(
    (val: Omit<NoteCategoryType, 'id'>) => postNoteCategory(val),
    ['note_categories'],
    (old: NoteCategoryType[], vals: NoteCategoryType) => [...old, vals],
    () => {
      setIsAdd(false);
    },
  );
  const editMutation = useUpdateMutation(
    (vals: NoteCategoryType) => putNoteCategory(noteCategoryToEdit?.id, vals),
    ['note_categories'],
    noteCategoryToEdit?.id,
    (vals: NoteCategoryType) => vals,
    () => {
      setNoteCategoryToEdit(null);
    },
  );

  const handleCancel = () => {
    setNoteCategoryToEdit(null);
    setNoteCategoryToDelete(null);
    setIsAdd(false);
  };

  const deleteMutation = useDeleteMutation(
    () => deleteNoteCategory(noteCategoryToDelete?.id),
    ['note_categories'],
    noteCategoryToDelete?.id,
    handleCancel,
  );

  const handleSubmit = (values: Omit<NoteCategoryType, 'note_count'>) => {
    if (isAdd) {
      // @ts-ignore
      addMutation.mutate({ name: values.name });
    } else {
      // @ts-ignore
      editMutation.mutate(values);
    }
  };

  const handleEditClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    note: NoteCategoryType,
  ) => {
    e.stopPropagation();
    setNoteCategoryToEdit(note);
    setIsAdd(false);
  };

  const handleDeleteClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    note: NoteCategoryType,
  ) => {
    e.stopPropagation();
    setNoteCategoryToDelete(note);
  };

  return (
    <div>
      <h1>Notes</h1>
      {noteCategoriesData.isLoading ? (
        <div>Loading...</div>
      ) : (
        <List>
          {noteCategoriesData.data.map((list: NoteCategoryType) => (
            <ListItemButton
              key={list.id}
              onClick={() => navigate(`/notes/${list.id}`)}
            >
              <ListItemText primary={list.name} />
              <ListItemIcon>
                <IconButton onClick={(e) => handleEditClick(e, list)}>
                  <EditIcon />
                </IconButton>
              </ListItemIcon>
              <ListItemIcon>
                <IconButton onClick={(e) => handleDeleteClick(e, list)}>
                  <CloseIcon />
                </IconButton>
              </ListItemIcon>
            </ListItemButton>
          ))}
        </List>
      )}
      <IconButton
        onClick={() => {
          setIsAdd(true);
          setNoteCategoryToEdit(null);
        }}
      >
        <AddIcon />
      </IconButton>
      {isAdd || noteCategoryToEdit ? (
        <AddNoteCategory
          handleSubmit={handleSubmit}
          initialValues={noteCategoryToEdit}
          handleCancel={handleCancel}
        />
      ) : null}
      <Dialog
        open={!!noteCategoryToDelete}
        fullScreen={fullScreen}
        onClose={handleCancel}
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {noteCategoryToDelete?.name} with
            all notes in it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} variant="outlined">
            Nooo
          </Button>
          <Button onClick={() => deleteMutation.mutate()} variant="contained">
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NoteCategories;
