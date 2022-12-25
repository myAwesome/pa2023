import React, { useContext, useCallback } from 'react';
import { Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UIContext from '../../context/UIContext';

const ErrorSnackbar = () => {
  const { error, setError } = useContext(UIContext);

  const handleClose = useCallback(() => {
    setError('');
  }, []);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={!!error}
      autoHideDuration={5000}
      onClose={handleClose}
      ContentProps={{
        sx: {
          backgroundColor: (theme) => theme.palette.error.main,
          color: (theme) => theme.palette.error.contrastText,
        },
      }}
      message={error}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
};

export default ErrorSnackbar;
