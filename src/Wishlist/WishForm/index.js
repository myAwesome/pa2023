import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, TextField, Box } from '@mui/material';

const WishForm = ({ onSubmit, handleChange, values }) => {
  return (
    <form onSubmit={onSubmit}>
      <FormGroup
        sx={{
          marginBottom: (theme) => theme.spacing(3),
        }}
      >
        <TextField
          fullWidth
          value={values.name}
          name="name"
          variant="standard"
          onChange={handleChange}
          label="Name"
        />
      </FormGroup>
      <FormGroup
        row
        sx={{
          marginBottom: (theme) => theme.spacing(3),
        }}
      >
        <Box
          style={{ backgroundImage: `url(${values.picture})` }}
          sx={{
            width: 400,
            height: 170,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (theme) => ({
              xs: '100%',
              sm: theme.palette.background.paper,
            }),
            marginRight: (theme) => theme.spacing(2),
          }}
        />
        <TextField
          sx={{
            flex: 1,
            minWidth: { xs: 'auto', sm: 350 },
          }}
          variant="standard"
          value={values.picture}
          name="picture"
          onChange={handleChange}
          label="Link to picture"
        />
      </FormGroup>
      <FormGroup
        row
        sx={{
          marginBottom: (theme) => theme.spacing(3),
        }}
      >
        <TextField
          sx={{ marginRight: (theme) => theme.spacing(2) }}
          type="number"
          variant="standard"
          value={values.priceFrom}
          name="priceFrom"
          onChange={handleChange}
          label="Price From"
        />
        <TextField
          type="number"
          variant="standard"
          value={values.priceTo}
          name="priceTo"
          onChange={handleChange}
          label="Price To"
        />
      </FormGroup>
      <FormGroup>
        <Button type="submit" fullWidth variant="outlined">
          Submit
        </Button>
      </FormGroup>
    </form>
  );
};

WishForm.propTypes = {
  handleChange: PropTypes.func,
  onSubmit: PropTypes.func,
  values: PropTypes.object,
};

export default WishForm;
