import React from 'react';
import PropTypes from 'prop-types';
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

const AddNote = ({ isOpen, initialValue, handleCancel, handleSubmit }) => {
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

AddNote.propTypes = {
  isOpen: PropTypes.bool,
  initialValue: PropTypes.string,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default AddNote;
