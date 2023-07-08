import React from 'react';
import {
  TextField,
  Button,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { WatchItemType } from '../../shared/types';

type Props = {
  handleSubmit: (
    vals: Omit<WatchItemType, 'last_seen' | 'id' | 'created_at'>,
  ) => void;
  handleCancel: () => void;
  handleRemove: () => void;
  initialValues: Omit<WatchItemType, 'id'> | null;
};

const AddWatch = ({
  handleSubmit,
  initialValues,
  handleCancel,
  handleRemove,
}: Props) => {
  const [watch, setWatch] = React.useState<
    Omit<WatchItemType, 'last_seen' | 'id' | 'created_at'>
  >(
    initialValues || {
      name: '',
      type: 'movie',
      is_seen: true,
      rating: 0,
    },
  );

  React.useEffect(() => {
    setWatch(
      initialValues || {
        name: '',
        type: 'movie',
        is_seen: true,
        rating: 0,
      },
    );
  }, [initialValues]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({
          name: watch.name,
          type: watch.type,
          rating: Number(watch.rating),
          is_seen: watch.is_seen,
        });
        setWatch({
          name: '',
          type: 'movie',
          is_seen: true,
          rating: 0,
        });
      }}
    >
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item md={4} xs={12}>
          <TextField
            name="name"
            fullWidth
            label="Name"
            variant="standard"
            value={watch.name}
            onChange={(e) => setWatch({ ...watch, name: e.target.value })}
          />
        </Grid>
        <Grid item md={1} xs={12}>
          <TextField
            name="rating"
            fullWidth
            type="number"
            variant="standard"
            label="Rating (1-10)"
            value={watch.rating}
            onChange={(e) =>
              setWatch({ ...watch, rating: Number(e.target.value) })
            }
          />
        </Grid>
        <Grid item md={2} xs={12}>
          <FormControl fullWidth>
            <InputLabel id="type-label" sx={{ top: '7px' }}>
              Type
            </InputLabel>
            <Select
              labelId="type-label"
              value={watch.type}
              onChange={(e) =>
                setWatch({
                  ...watch,
                  type: e.target.value as
                    | 'movie'
                    | 'series'
                    | 'mini-series'
                    | 'cartoon',
                })
              }
              variant="standard"
            >
              <MenuItem value="movie">Movie</MenuItem>
              <MenuItem value="series">Series</MenuItem>
              <MenuItem value="mini-series">Mini-series</MenuItem>
              <MenuItem value="cartoon">Cartoon</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item md={1} xs={12}>
          <FormControl fullWidth>
            <FormControlLabel
              value="is_seen"
              control={
                <Switch
                  checked={watch.is_seen}
                  onChange={() =>
                    setWatch({ ...watch, is_seen: !watch.is_seen })
                  }
                />
              }
              label="Seen"
              labelPlacement="top"
            />
          </FormControl>
        </Grid>
        <Grid item md={4} xs={12}>
          <Button onClick={handleRemove}>Remove</Button>
          <Button type="submit">Submit</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default AddWatch;
