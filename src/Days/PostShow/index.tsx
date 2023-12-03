import React, { FormEvent, Fragment } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Box, Paper, TextField } from '@mui/material';
import { QueryKey } from '@tanstack/react-query';
import PostLabel from '../PostLabel';
import {
  addLabelToPost,
  deleteLabelFromPost,
  deletePost,
  editPost,
} from '../../shared/api/routes';
import { useUpdateMutation } from '../../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../../shared/hooks/useDeleteMutation';
import { LabelType, PostType } from '../../shared/types';
import { dateToMySQLFormat } from '../../shared/utils/mappers';
import PostEdit from './PostEdit';
import PostComment from './PostComment';
import PostCommentEdit from './PostCommentEdit';
import PostPhotos from './PostPhotos';

dayjs.extend(utc);
dayjs.extend(relativeTime);

type Props = {
  post: PostType;
  labels: LabelType[];
  searchTerm?: string;
  invalidateQueries: QueryKey;
};

const PostShow = ({ post, labels, searchTerm, invalidateQueries }: Props) => {
  const [deleteMode, setDeletedMode] = React.useState(false);
  const [isCommentOpen, setCommentOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [updateDate, setUpdateDate] = React.useState(
    dayjs(post.date.slice(0, 10)).format('YYYY-MM-DD'),
  );
  const deletePostMutation = useDeleteMutation(
    () => deletePost(post.id),
    invalidateQueries,
    post.id,
  );
  const toggleLabelMutation = useUpdateMutation(
    ({ isActive, labelId }: { isActive: boolean; labelId: number }) =>
      isActive
        ? deleteLabelFromPost(post.id, labelId)
        : addLabelToPost(post.id, labelId),
    invalidateQueries,
    post.id,
    (
      { isActive, labelId }: { isActive: boolean; labelId: number },
      post: PostType,
    ) => ({
      labels: isActive
        ? post.labels.filter((l) => l !== labelId)
        : post.labels.concat(labelId),
    }),
  );
  const editPostMutation = useUpdateMutation(
    (body: string) =>
      editPost(post.id, { body, date: dateToMySQLFormat(updateDate) }),
    invalidateQueries,
    post.id,
    (body: string) => ({
      body,
      date: dateToMySQLFormat(updateDate),
    }),
    () => setIsEdit(false),
  );

  const toggleDeleteMode = () => {
    setDeletedMode(!deleteMode);
  };

  const handleSubmit = (e: FormEvent, updateText: string) => {
    e.preventDefault();
    editPostMutation.mutate(updateText);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {' '}
        {parts.map((part, i) => (
          <Box
            component="span"
            key={i}
            sx={
              part.toLowerCase() === highlight.toLowerCase()
                ? {
                    backgroundColor: (theme) =>
                      theme.palette.secondary[theme.palette.mode],
                    borderRadius: '6px',
                    padding: '1px 3px',
                  }
                : {}
            }
          >
            {part}
          </Box>
        ))}{' '}
      </span>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Paper>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          gap={2}
          sx={{
            position: 'relative',
            top: -14,
          }}
        >
          <Grid
            item
            sx={{
              padding: (theme) => theme.spacing(0, 1),
            }}
            title={dayjs(post.date).fromNow(true)}
          >
            {isEdit ? (
              <TextField
                name="update Date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                type="date-local"
                sx={{
                  width: 140,
                }}
                size="small"
                variant="standard"
              />
            ) : (
              dayjs(post.date.slice(0, 10)).format('dddd YYYY-MM-DD')
            )}
          </Grid>
          <Grid item>
            {labels.map((l) => (
              <PostLabel
                key={l.id}
                label={l}
                onClick={(e, isActive) =>
                  toggleLabelMutation.mutate({ isActive, labelId: l.id })
                }
                isActive={!!post.labels.find((pl) => pl === l.id)}
              />
            ))}
          </Grid>
          <Grid item gap={2}>
            <Button
              onClick={() => setIsEdit(true)}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 32,
              }}
              disabled={post.id === 0 || editPostMutation.isLoading}
            >
              edit
            </Button>
            <Button
              onClick={() => setCommentOpen(true)}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 32,
              }}
              disabled={post.id === 0 || editPostMutation.isLoading}
            >
              cmnt
            </Button>
            <Button
              onClick={toggleDeleteMode}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 32,
              }}
              disabled={post.id === 0 || editPostMutation.isLoading}
            >
              x
            </Button>
          </Grid>
        </Grid>

        {deleteMode ? (
          <Box
            sx={{
              margin: 'auto',
              minHeight: 70,
              width: '100%',
              textAlign: 'left',
              lineHeight: '150%',
              position: 'relative',
              padding: (theme) => theme.spacing(1.2),
              paddingTop: 0,
              marginTop: (theme) => theme.spacing(1.5),
            }}
          >
            <Box
              sx={{
                width: '95%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Button
                variant="contained"
                onClick={() => setDeletedMode(false)}
                sx={{
                  width: '40%',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={deletePostMutation.mutate}
                sx={{
                  width: '40%',
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              margin: 'auto',
              minHeight: 70,
              width: '100%',
              textAlign: 'left',
              lineHeight: '150%',
              position: 'relative',
              padding: (theme) => theme.spacing(1.2),
              paddingTop: 0,
              marginTop: (theme) => theme.spacing(1.5),
            }}
          >
            {isEdit ? (
              <PostEdit
                body={post.body}
                onCancel={() => setIsEdit(false)}
                handleSubmit={handleSubmit}
              />
            ) : (
              <p>
                {post.body.split('\n').map((item, key) => (
                  <Fragment key={key}>
                    {searchTerm ? getHighlightedText(item, searchTerm) : item}
                    <br />
                  </Fragment>
                ))}
              </p>
            )}
            {post.periods && post.periods.length > 0 ? (
              <Grid container flexWrap="wrap" gap={1}>
                {post.periods.map((period) => (
                  <Grid item key={period.id}>
                    <Chip
                      label={period.name}
                      sx={{
                        color: (theme) => theme.palette.primary.light,
                      }}
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            ) : null}
            <PostPhotos date={post.date} />
            {post.comments.map((comment) => (
              <PostComment key={comment.id} comment={comment} />
            ))}
            {isCommentOpen ? (
              <PostCommentEdit
                postId={post.id}
                onCancel={() => {
                  setCommentOpen(false);
                }}
                invalidateQueries={invalidateQueries}
              />
            ) : (
              ''
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PostShow;
