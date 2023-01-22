import React from 'react';
import {
  Typography,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  Checkbox,
  FormControl,
  FormControlLabel,
} from '@mui/material';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { deleteWish, getWishes, putWish } from '../../shared/api/routes';
import { useDeleteMutation } from '../../shared/hooks/useDeleteMutation';
import WishEdit from '../WishEdit';
import { useUpdateMutation } from '../../shared/hooks/useUpdateMutation';
import { WishType } from '../../shared/types';

const WishList = () => {
  const { data, isLoading } = useQuery(['wishes'], getWishes);
  const [showImg, setShowImg] = React.useState<string>('');
  const [shouldHideDone, setHideDone] = React.useState(true);
  const [wishesToShow, setWishesToShow] = React.useState([]);
  const [wishToEdit, setWishToEdit] = React.useState<WishType | null>(null);

  React.useEffect(() => {
    if (data && !isLoading) {
      if (shouldHideDone) {
        setWishesToShow(data.filter((w: WishType) => !w.is_done));
      } else {
        setWishesToShow(data);
      }
    }
  }, [data, shouldHideDone, isLoading]);

  const removeWishMutation = useDeleteMutation(
    (id: number) => deleteWish(id),
    ['wishes'],
  );

  const editWishMutation = useUpdateMutation(
    ({ id, ...values }: WishType) => putWish(id, values),
    ['wishes'],
    'id-from-payload',
    ({ id, ...values }: WishType) => ({ id, ...values }),
  );

  const openEditPopup = (w: WishType) => {
    setWishToEdit(w);
  };

  const handleCloseEdit = () => {
    setWishToEdit(null);
  };

  return (
    <div>
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={shouldHideDone}
              onChange={(e) => setHideDone(e.target.checked)}
            />
          }
          label="Hide done"
        />
      </FormControl>
      <Grid container gap={2} justifyContent="space-between">
        {wishesToShow.map((w: WishType) => {
          const isMine = true;
          return (
            <Grid
              key={w.id}
              item
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 8px)',
                  lg: 'calc(30% - 8px)',
                },
              }}
            >
              <Card
                sx={{
                  border: (theme) =>
                    w.is_done
                      ? `3px dotted ${theme.palette.secondary.main}`
                      : '',
                }}
              >
                <CardMedia
                  image={w.picture}
                  title={w.name}
                  sx={{
                    height: 170,
                  }}
                  onClick={() => setShowImg(w.picture)}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {w.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {w.price_from} - {w.price_to} грн.
                  </Typography>
                  <Typography variant="caption">
                    {dayjs(w.created_at).format('DD-MM-YYYY')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button onClick={() => openEditPopup(w)} disabled={!isMine}>
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      const { created_at, ...vals } = w;
                      editWishMutation.mutate({
                        ...vals,
                        is_done: true,
                      });
                    }}
                    disabled={!isMine || w.is_done}
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => {
                      removeWishMutation.mutate(w.id);
                    }}
                    disabled={!isMine}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        <Dialog open={!!showImg} onClose={() => setShowImg('')}>
          <img
            src={showImg}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
            alt="wish"
          />
        </Dialog>
      </Grid>
      <WishEdit
        onSubmit={(val) => {
          editWishMutation.mutate(val);
        }}
        handleClose={handleCloseEdit}
        isOpen={!!wishToEdit}
        wish={wishToEdit}
      />
    </div>
  );
};

export default WishList;
