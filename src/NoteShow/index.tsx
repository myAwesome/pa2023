import React, { Fragment } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { IconButton, ListItem, Menu, Paper, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import { useCreateMutation } from '../shared/hooks/useCreateMutation';
import { useDeleteMutation } from '../shared/hooks/useDeleteMutation';
import { deleteNote, getNotes, postNote, editNote } from '../shared/api/routes';
import { NoteType } from '../shared/types';
import AddNote from './AddNote';

const NoteCategoryShow = () => {
  const params = useParams();
  const [menuAnchorElement, setMenuAnchorElement] =
    React.useState<HTMLButtonElement | null>(null);
  const [pressedNote, setPressedNote] = React.useState<NoteType | null>(null);
  const [isAdd, setIsAdd] = React.useState(false);
  const [noteToEdit, setNoteToEdit] = React.useState<NoteType | null>(null);
  const notesData = useQuery(['notes', params.id], () =>
    getNotes(params.id || 0),
  );
  const editMutation = useUpdateMutation(
    (vals: Omit<NoteType, 'id'>) => editNote(noteToEdit?.id || 0, vals),
    ['notes', params.id],
    noteToEdit?.id,
    (val: NoteType) => val,
    () => {
      setNoteToEdit(null);
    },
  );
  const addMutation = useCreateMutation(
    (vals: NoteType) => postNote({ ...vals, note_category: Number(params.id) }),
    ['notes', params.id],
    (old: NoteType[], vals: NoteType) => [...old, vals],
    () => setIsAdd(false),
  );

  const handleMenuClose = () => {
    setPressedNote(null);
    setMenuAnchorElement(null);
  };

  const deleteMutation = useDeleteMutation(
    (id: number) => deleteNote(id),
    ['notes', params.id],
    null,
    handleMenuClose,
  );

  const handleSubmit = (values: Omit<NoteType, 'id' | 'note_category'>) => {
    if (isAdd) {
      addMutation.mutate(values);
    } else {
      editMutation.mutate(values);
    }
  };

  const handleCancel = () => {
    setIsAdd(false);
    setNoteToEdit(null);
  };

  const handleMoreClick = (note: NoteType, element: HTMLButtonElement) => {
    setPressedNote(note);
    setMenuAnchorElement(element);
  };

  return (
    <div>
      <IconButton
        onClick={() => {
          setIsAdd(true);
          setNoteToEdit(null);
        }}
      >
        <AddIcon />
      </IconButton>
      {notesData.isLoading ? (
        <div>Loading...</div>
      ) : (
        notesData.data.map((note: NoteType, index: number) => (
          <Paper
            key={note.id}
            sx={{
              position: 'relative',
              padding: (theme) => theme.spacing(2),
              textAlign: 'left',
              color: (theme) => theme.palette.text.secondary,
              wordBreak: 'break-word',
              marginBottom: (theme) => theme.spacing(2),
            }}
          >
            <Typography
              sx={{
                marginRight: 20,
              }}
            >
              {index + 1}{' '}
              {note.body.split('\n').map((item, key) => (
                <Fragment key={key}>
                  {item}
                  <br />
                </Fragment>
              ))}
            </Typography>
            <IconButton
              onClick={(event) => handleMoreClick(note, event.currentTarget)}
              sx={{
                padding: (theme) => theme.spacing(0.5),
                position: 'absolute',
                bottom: 11,
                right: 0,
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Paper>
        ))
      )}
      <Menu
        anchorEl={menuAnchorElement}
        open={Boolean(menuAnchorElement)}
        onClose={handleMenuClose}
      >
        <ListItem
          onClick={() => {
            setNoteToEdit(pressedNote);
            handleMenuClose();
          }}
        >
          Edit
        </ListItem>
        <ListItem
          onClick={() => {
            deleteMutation.mutate(pressedNote!.id);
          }}
        >
          Delete
        </ListItem>
      </Menu>
      <AddNote
        isOpen={isAdd || !!noteToEdit}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        initialValue={noteToEdit?.body || ''}
      />
    </div>
  );
};

export default NoteCategoryShow;
