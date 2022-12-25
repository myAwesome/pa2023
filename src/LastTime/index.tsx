import React from 'react';
import {
  Divider,
  IconButton,
  List,
  Popover,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import moment from 'moment';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { deleteLT, getLts, postLT, putLT } from '../shared/api/routes';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import { useCreateMutation } from '../shared/hooks/useCreateMutation';
import { useDeleteMutation } from '../shared/hooks/useDeleteMutation';
import { LastTimeItemType } from '../shared/types';
import LastTimeEntry from './LastTimeEntry';
import AddLastTime from './AddLastTime';

const LastTime = () => {
  const [isAdd, setIsAdd] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [itemToUpdate, setItemToUpdate] =
    React.useState<LastTimeItemType | null>(null);
  const [itemToEdit, setItemToEdit] = React.useState<LastTimeItemType | null>(
    null,
  );
  const [updateDate, setUpdateDate] = React.useState(
    moment().format('YYYY-MM-DDTHH:mm'),
  );
  const lastTimeData = useQuery(['last_times'], getLts);
  const updateMutation = useUpdateMutation(
    (values: LastTimeItemType) =>
      putLT((itemToEdit || itemToUpdate)?.id, {
        ...(itemToEdit || itemToUpdate),
        ...values,
      }),
    ['last_times'],
    (itemToEdit || itemToUpdate)?.id,
    (values: LastTimeItemType) => ({
      ...(itemToEdit || itemToUpdate),
      ...values,
    }),
    () => {
      setIsEdit(false);
      setIsAdd(false);
      setItemToEdit(null);
      setItemToUpdate(null);
      setAnchorEl(null);
    },
    ['expired_last_times'],
  );
  const createMutation = useCreateMutation(
    (data: LastTimeItemType) => postLT(data),
    ['last_times'],
    (old: LastTimeItemType[], data: LastTimeItemType) => [data, ...old],
    () => {
      setIsEdit(false);
      setIsAdd(false);
      setItemToEdit(null);
      setItemToUpdate(null);
    },
  );
  const deleteMutation = useDeleteMutation(
    () => deleteLT(itemToEdit?.id),
    ['last_times'],
    itemToEdit?.id,
    () => {},
    ['expired_last_times'],
  );

  const handleListItemClick = (
    e: React.MouseEvent<HTMLDivElement>,
    item: LastTimeItemType,
  ) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setItemToUpdate(item);
  };

  const handleSubmit = (values: LastTimeItemType) => {
    const action = isAdd ? createMutation : updateMutation;
    // @ts-ignore
    action.mutate(values);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setItemToUpdate(null);
  };

  const handleItemClicked = (item: LastTimeItemType) => {
    setIsEdit(true);
    setIsAdd(false);
    setItemToEdit(item);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setIsAdd(false);
    setItemToEdit(null);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setIsEdit(false);
    setItemToUpdate(null);
  };

  const handleRemove = () => {
    setIsEdit(false);
    setIsAdd(false);
    if (itemToEdit?.id) {
      deleteMutation.mutate();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <h1>LastTime</h1>
      <Grid container>
        <Grid item xs={12} sm={1}>
          <IconButton onClick={handleAdd}>
            <AddIcon />
          </IconButton>
        </Grid>
        {(isAdd || isEdit) && itemToEdit ? (
          <Grid item xs={12} sm={11}>
            <AddLastTime
              handleSubmit={handleSubmit}
              initialValues={itemToEdit}
              handleCancel={handleCancel}
              handleRemove={handleRemove}
            />
          </Grid>
        ) : null}
      </Grid>
      {lastTimeData.isLoading ? (
        'Loading...'
      ) : (
        <List>
          {lastTimeData.data.map((item: LastTimeItemType) => (
            <React.Fragment key={item.id}>
              <LastTimeEntry
                item={item}
                handleItemClicked={handleItemClicked}
                handleListItemClick={handleListItemClick}
              />
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Grid container spacing={1}>
          <Grid item>
            <TextField
              fullWidth
              name="update Date"
              variant="standard"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              type="datetime-local"
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                // @ts-ignore
                updateMutation.mutate({ date: moment(updateDate) });
              }}
            >
              OK
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};
export default LastTime;
