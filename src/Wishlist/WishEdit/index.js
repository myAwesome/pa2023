import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@mui/material';
import WishForm from '../WishForm';

const WishEdit = ({ isOpen, wish, onSubmit, handleClose }) => {
  const [values, setValues] = React.useState(wish || {});
  React.useEffect(() => {
    setValues(wish || {});
  }, [wish]);
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      classes={{
        paper: {
          padding: (theme) => theme.spacing(4),
        },
      }}
    >
      <WishForm
        values={values}
        handleChange={handleChange}
        onSubmit={(e) => {
          e.preventDefault();
          handleClose();
          onSubmit({
            ...values,
            id: wish.id,
            priceFrom: Number(values.priceFrom),
            priceTo: Number(values.priceTo),
          });
        }}
      />
    </Dialog>
  );
};

WishEdit.propTypes = {
  isOpen: PropTypes.bool,
  wish: PropTypes.object,
  onSubmit: PropTypes.func,
  handleClose: PropTypes.func,
};

export default WishEdit;
