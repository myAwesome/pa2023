import React, { ChangeEvent, useCallback } from 'react';
import { TextField, Button, Stack } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CountdownType } from '../shared/types';

dayjs.extend(utc);

type Props = {
  handleSubmit: (
    vals: Omit<CountdownType, 'id' | 'created_at' | 'user_id' | 'is_done'>,
  ) => void;
  initialValues: CountdownType | null;
  handleCancel: () => void;
};

const AddCountdown = ({ handleSubmit, initialValues, handleCancel }: Props) => {
  const [values, setValues] = React.useState({
    name: initialValues?.name || '',
    date: initialValues?.date
      ? dayjs(initialValues.date).utc(true).local().toISOString().slice(0, 19)
      : '',
  });

  React.useEffect(() => {
    setValues({
      name: initialValues?.name || '',
      date: initialValues?.date
        ? dayjs(initialValues.date).utc(true).local().toISOString().slice(0, 19)
        : '',
    });
  }, [initialValues]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    [],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(values);
      }}
    >
      <Stack gap={3} direction="row" alignItems="center">
        <TextField
          name="name"
          fullWidth
          variant="standard"
          label="Title"
          value={values.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          name="date"
          variant="standard"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={values.date}
          onChange={handleChange}
          InputProps={{ sx: { colorScheme: (theme) => theme.palette.mode } }}
          type="datetime-local"
        />
        <Stack gap={2} direction="row" alignItems="center">
          <Button type="submit">Submit</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default AddCountdown;
