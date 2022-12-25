import React, { FormEvent } from 'react';
import { TextField, Button, Grid } from '@mui/material';

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
        <Grid item xs={12}>
          <TextField
            multiline
            sx={{
              width: '100%',
            }}
            value={updatedValue}
            variant="standard"
            onChange={handleText}
            InputProps={{
              sx: {
                fontSize: '0.875rem',
                lineHeight: '150%',
              },
            }}
          />
        </Grid>
        <Grid item>
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
