import React, { FormEvent } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { QueryKey } from '@tanstack/react-query';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { postComment } from '../../../shared/api/routes';
import { PostType } from '../../../shared/types';
import { dateToMySQLFormat } from '../../../shared/utils/mappers';

let today: string | Date = new Date();
let dd: string | number = today.getDate();
let mm: string | number = today.getMonth() + 1;
const yyyy = today.getFullYear();

if (dd < 10) {
  dd = `0${dd}`;
}

if (mm < 10) {
  mm = `0${mm}`;
}

today = `${yyyy}-${mm}-${dd}`;

type Props = {
  postId: number;
  onCancel: () => void;
  invalidateQueries: QueryKey;
};

const PostCommentEdit = ({ postId, onCancel, invalidateQueries }: Props) => {
  const [commentBody, setCommentBody] = React.useState('');
  const addMutation = useCreateMutation(
    (d: { body: string; postId: string }) => postComment(d),
    invalidateQueries,
    (old: PostType[], vals: { body: string; postId: number }) => {
      const newItems = [...old];
      const thisPostIndex = newItems.findIndex((p) => p.id === postId);
      newItems[thisPostIndex] = {
        ...newItems[thisPostIndex],
        comments: [
          ...newItems[thisPostIndex].comments,
          {
            id: -1,
            date: new Date().toISOString(),
            body: vals.body,
            post_id: postId,
          },
        ],
      };
      return newItems;
    },
    onCancel,
  );

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentBody(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      body: commentBody,
      post_id: postId,
      date: dateToMySQLFormat(),
    });
  };

  return (
    <Paper style={{ width: '100%', padding: '0 10px 5px 10px' }}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item style={{ minWidth: 91 }}>
          <Typography>{today.toString()}</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            value={commentBody}
            onChange={handleText}
            name="comment"
            placeholder="Comment"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Send</Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PostCommentEdit;
