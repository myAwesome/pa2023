import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Stack } from '@mui/material';

type Props = {
  handleSubmit: (val: string) => void;
  initialValue?: string;
  handleCancel: () => void;
};

const TransactionsCategoriesCreate = ({
  handleSubmit,
  initialValue,
  handleCancel,
}: Props) => {
  const [value, setValue] = React.useState(initialValue || '');

  React.useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Stack direction="row" gap={2}>
      <TextField
        type="text"
        variant="standard"
        value={value}
        onChange={handleText}
        fullWidth
      />
      <Button
        type="submit"
        variant="outlined"
        onClick={() => handleSubmit(value)}
      >
        Save
      </Button>
      <Button onClick={handleCancel} variant="outlined">
        Cancel
      </Button>
    </Stack>
  );
};

export default TransactionsCategoriesCreate;
