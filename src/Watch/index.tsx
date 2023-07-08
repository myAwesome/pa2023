import React from 'react';
import {
  Divider,
  IconButton,
  List,
  Popover,
  Grid,
  TextField,
  Button,
  Stack,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { useQuery } from '@tanstack/react-query';
import {
  getWatch,
  editWatch,
  deleteWatch,
  postWatch,
} from '../shared/api/routes';
import { useUpdateMutation } from '../shared/hooks/useUpdateMutation';
import { useCreateMutation } from '../shared/hooks/useCreateMutation';
import { useDeleteMutation } from '../shared/hooks/useDeleteMutation';
import { WatchItemType } from '../shared/types';
import { dateToMySQLFormat } from '../shared/utils/mappers';
import WatchEntry from './WatchEntry';
import AddWatch from './AddWatch';

const Watch = () => {
  const [isAdd, setIsAdd] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [filterSeen, setFilterSeen] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [itemToUpdate, setItemToUpdate] = React.useState<WatchItemType | null>(
    null,
  );
  const [itemToEdit, setItemToEdit] = React.useState<WatchItemType | null>(
    null,
  );
  const [updateDate, setUpdateDate] = React.useState(
    dayjs().format('YYYY-MM-DDTHH:mm'),
  );
  const watchData = useQuery(
    ['watch', { filterType, filterSeen, sortBy, sortDir }],
    () => {
      const params: Record<string, any> = { $limit: 5000 };
      if (filterType) {
        params.type = filterType;
      }
      if (filterSeen) {
        params.is_seen = filterSeen === 'seen' ? 1 : 0;
      }
      if (sortBy) {
        params['$sort'] = { [sortBy]: sortDir === 'asc' ? '1' : '-1' };
      }
      return getWatch(params);
    },
  );
  const updateMutation = useUpdateMutation(
    (values: WatchItemType) =>
      editWatch((itemToEdit || itemToUpdate)?.id || 0, values),
    ['watch'],
    (itemToEdit || itemToUpdate)?.id,
    (values: WatchItemType) => ({
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
  );
  const createMutation = useCreateMutation(
    (data: WatchItemType) => postWatch(data),
    ['watch'],
    (old: WatchItemType[], data: WatchItemType) => [data, ...old],
    () => {
      setIsEdit(false);
      setIsAdd(false);
      setItemToEdit(null);
      setItemToUpdate(null);
    },
  );
  const deleteMutation = useDeleteMutation(
    () => deleteWatch(itemToEdit?.id || 0),
    ['watch'],
    itemToEdit?.id,
    () => {},
  );

  const handleListItemClick = (
    e: React.MouseEvent<HTMLDivElement>,
    item: WatchItemType,
  ) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setItemToUpdate(item);
  };

  const handleSubmit = (
    values: Omit<WatchItemType, 'last_seen' | 'id' | 'created_at'>,
  ) => {
    const action = isAdd ? createMutation : updateMutation;
    action.mutate(values);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setItemToUpdate(null);
  };

  const handleItemClicked = (item: WatchItemType) => {
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
      deleteMutation.mutate(itemToEdit?.id);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <h1>Big screen, small screen, any screen</h1>
      <Stack alignItems="center" gap={2} direction="row">
        <IconButton onClick={handleAdd}>
          <AddIcon />
        </IconButton>
        <FormControl fullWidth>
          <InputLabel id="type-label">Category</InputLabel>
          <Select
            labelId="type-label"
            value={filterType}
            margin="none"
            onChange={(e) =>
              setFilterType(e.target.value === 'all' ? null : e.target.value)
            }
            variant="standard"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="movie">Movie</MenuItem>
            <MenuItem value="series">Series</MenuItem>
            <MenuItem value="mini-series">Mini-series</MenuItem>
            <MenuItem value="cartoon">Cartoon</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="seen-label">Is seen</InputLabel>
          <Select
            labelId="seen-label"
            value={filterSeen}
            margin="none"
            onChange={(e) =>
              setFilterSeen(e.target.value === 'all' ? null : e.target.value)
            }
            variant="standard"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="seen">Only seen</MenuItem>
            <MenuItem value="not_seen">Only not seen</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="sort-label">Sort by</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            margin="none"
            onChange={(e) =>
              setSortBy(e.target.value === 'none' ? null : e.target.value)
            }
            variant="standard"
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="last_seen">Last seen</MenuItem>
          </Select>
        </FormControl>
        <IconButton
          onClick={() =>
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
          }
        >
          {sortDir === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
        </IconButton>
      </Stack>
      {isAdd || (isEdit && itemToEdit) ? (
        <AddWatch
          handleSubmit={handleSubmit}
          initialValues={itemToEdit}
          handleCancel={handleCancel}
          handleRemove={handleRemove}
        />
      ) : null}
      {watchData.isLoading ? (
        'Loading...'
      ) : (
        <List>
          {watchData.data?.map((item: WatchItemType) => (
            <React.Fragment key={item.id}>
              <WatchEntry
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
              InputProps={{
                sx: { colorScheme: (theme) => theme.palette.mode },
              }}
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                updateMutation.mutate({
                  last_seen: dateToMySQLFormat(updateDate),
                });
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
export default Watch;
