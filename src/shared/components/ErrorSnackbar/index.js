import React from 'react';
import PropTypes from 'prop-types';
import { Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ErrorSnackbar = ({ error, handleClose }) => {
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

ErrorSnackbar.propTypes = {
  error: PropTypes.string,
  handleClose: PropTypes.func,
};

export default ErrorSnackbar;
