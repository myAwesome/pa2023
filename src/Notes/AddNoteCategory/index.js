import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Button, Grid } from '@mui/material';

const initialState = { name: '' };

const AddNoteCategory = ({ handleSubmit, initialValues, handleCancel }) => {
  const [values, setValues] = React.useState(initialValues || initialState);

  React.useEffect(() => {
    setValues(initialValues || initialState);
  }, [initialValues]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(values);
        setValues(initialState);
      }}
    >
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item md={9} xs={12}>
          <TextField
            name="name"
            fullWidth
            variant="standard"
            label="Title"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <Button type="submit">Submit</Button>
          <Button
            onClick={() => {
              handleCancel();
              setValues(initialState);
            }}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

AddNoteCategory.propTypes = {
  handleSubmit: PropTypes.func,
};

export default AddNoteCategory;
