import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NoteType } from '../../shared/types';

type Props = {
  isOpen: boolean;
  initialValue: string;
  handleCancel: () => void;
  handleSubmit: (val: Omit<NoteType, 'id' | 'note_category'>) => void;
};

const AddNote = ({
  isOpen,
  initialValue,
  handleCancel,
  handleSubmit,
}: Props) => {
  const [text, setText] = React.useState(initialValue || '');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    setText(initialValue || '');
  }, [initialValue]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{initialValue ? 'Edit' : 'Add'} note</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          rows={5}
          fullWidth
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleCancel();
            setText('');
          }}
          variant="outlined"
          color="primary"
        >
          Forget it
        </Button>
        <Button
          onClick={() => {
            handleSubmit({ body: text });
            setText('');
          }}
          variant="contained"
          disabled={!text}
          color="primary"
        >
          {initialValue ? 'Edit' : 'Add'} note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNote;
