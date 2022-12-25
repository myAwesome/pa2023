import React from 'react';
import moment from 'moment';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { postPost } from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';

const today = moment().format('YYYY-MM-DD');
const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
const createPost = (body: string, date: string) => ({
  body,
  date: moment.utc(date),
});

const PostCreate = () => {
  const [value, setValue] = React.useState('');
  const [date, setDate] = React.useState(today);
  const createPostMutation = useCreateMutation(
    () => postPost(createPost(value, date)),
    ['recent_posts'],
    (old: any[]) => [
      { ...createPost(value, date), id: 'new', labels: [], comments: [] },
      ...old,
    ],
    () => {
      setValue('');
    },
  );

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = () => {
    if (value) {
      createPostMutation.mutate();
    }
  };

  return (
    <form style={{ marginBottom: '30px', textAlign: 'center' }}>
      <TextField
        multiline
        fullWidth
        rows={4}
        variant="outlined"
        value={value}
        onChange={handleText}
      />
      <Button
        style={{ marginRight: 15 }}
        onClick={() =>
          handleDate({
            target: { value: yesterday },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        color="inherit"
      >
        Yesterday
      </Button>
      <TextField
        style={{ marginRight: 15 }}
        type="date"
        value={date}
        onChange={handleDate}
        variant="standard"
      />
      <Button
        onClick={() =>
          handleDate({
            target: { value: today },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        color="inherit"
      >
        Today
      </Button>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        Send
      </Button>
    </form>
  );
};

export default PostCreate;
