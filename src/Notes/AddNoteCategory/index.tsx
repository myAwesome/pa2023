import React from 'react';
import { TextField, Button, Grid } from '@mui/material';
import { NoteCategoryType } from '../../shared/types';

const initialState = { name: '', id: 0 };

type InitialValues = Omit<NoteCategoryType, 'note_count'>;

type Props = {
  handleSubmit: (val: InitialValues) => void;
  initialValues: InitialValues | null;
  handleCancel: () => void;
};

const AddNoteCategory = ({
  handleSubmit,
  initialValues,
  handleCancel,
}: Props) => {
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

export default AddNoteCategory;
