import React from 'react';
import {
  TextField,
  Checkbox,
  Button,
  Grid,
  FormControlLabel,
} from '@mui/material';
import { ProjectType } from '../../shared/types';

type Props = {
  handleSubmit: (vals: Omit<ProjectType, 'id'>) => void;
  initialValues: ProjectType | null;
  handleCancel: () => void;
};

const AddProject = ({ handleSubmit, initialValues, handleCancel }: Props) => {
  const [values, setValues] = React.useState(
    initialValues || { title: '', description: '', archived: false },
  );

  React.useEffect(() => {
    setValues(initialValues || { title: '', description: '', archived: false });
  }, [initialValues]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(values);
      }}
    >
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item md={3} xs={12}>
          <TextField
            name="title"
            fullWidth
            variant="standard"
            label="Title"
            value={values.title}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <TextField
            name="description"
            fullWidth
            variant="standard"
            label="Description"
            value={values.description}
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
          />
        </Grid>
        <Grid item md={2} xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={values.archived}
                onChange={() =>
                  setValues({ ...values, archived: !values.archived })
                }
              />
            }
            label="Archived"
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <Button type="submit">Submit</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default AddProject;
