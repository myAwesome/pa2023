import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Button, Grid } from '@mui/material';
import moment from 'moment';

const AddLastTime = ({
  handleSubmit,
  initialValues,
  handleCancel,
  handleRemove,
}) => {
  const [lt, setLt] = React.useState(
    initialValues || { body: '', date: moment(), remind_after_days: '' },
  );

  React.useEffect(() => {
    setLt(initialValues || { body: '', date: moment(), remind_after_days: '' });
  }, [initialValues]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({
          ...lt,
          remind_after_days: parseInt(lt.remind_after_days, 10),
        });
        setLt({ body: '', date: moment(), remind_after_days: '' });
      }}
    >
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item md={4} xs={12}>
          <TextField
            name="title"
            fullWidth
            label="Title"
            variant="standard"
            value={lt.body}
            onChange={(e) => setLt({ ...lt, body: e.target.value })}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <TextField
            name="reminder"
            fullWidth
            type="number"
            variant="standard"
            label="Remind after (days)"
            value={lt.remind_after_days}
            onChange={(e) =>
              setLt({ ...lt, remind_after_days: e.target.value })
            }
          />
        </Grid>
        <Grid item md={5} xs={12}>
          <Button onClick={handleRemove}>Remove</Button>
          <Button type="submit">Submit</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Grid>
      </Grid>
    </form>
  );
};

AddLastTime.propTypes = {
  handleSubmit: PropTypes.func,
};

export default AddLastTime;
