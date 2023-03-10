import React from 'react';
import { TextField, Button, Grid } from '@mui/material';
import { LastTimeItemType } from '../../shared/types';

type Props = {
  handleSubmit: (
    vals: Omit<LastTimeItemType, 'expired' | 'id' | 'date'>,
  ) => void;
  handleCancel: () => void;
  handleRemove: () => void;
  initialValues: Omit<LastTimeItemType, 'expired'> | null;
};

const AddLastTime = ({
  handleSubmit,
  initialValues,
  handleCancel,
  handleRemove,
}: Props) => {
  const [lt, setLt] = React.useState(
    initialValues || {
      body: '',
      remind_after_days: '',
    },
  );

  React.useEffect(() => {
    setLt(
      initialValues || {
        body: '',
        remind_after_days: '',
      },
    );
  }, [initialValues]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({
          body: lt.body,
          remind_after_days: Number(lt.remind_after_days),
        });
        setLt({
          id: 0,
          body: '',
          remind_after_days: '',
        });
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

export default AddLastTime;
