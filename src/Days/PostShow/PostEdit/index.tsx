import React, { FormEvent } from 'react';
import { TextField, Button } from '@mui/material';
import Grid from '@mui/material/Grid';

type Props = {
  body: string;
  onCancel: () => void;
  handleSubmit: (e: FormEvent, newVal: string) => void;
};

const PostEdit = ({ body, onCancel, handleSubmit }: Props) => {
  const [updatedValue, setUpdatedValue] = React.useState(body);

  React.useEffect(() => {
    setUpdatedValue(body);
  }, [body]);

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedValue(e.target.value);
  };

  return (
    <form style={{ marginTop: 10 }}>
      <Grid container justifyContent="center">
        <Grid size={12}>
          <TextField
            multiline
            fullWidth
            value={updatedValue}
            variant="standard"
            onChange={handleText}
          />
        </Grid>
        <Grid>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" onClick={(e) => handleSubmit(e, updatedValue)}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default PostEdit;
