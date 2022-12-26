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
  const { data: wishes, isLoading } = useQuery(['wishes'], getWishes);
  const [showImg, setShowImg] = React.useState<string>('');
  const [shouldHideDone, setHideDone] = React.useState(true);
  const [wishesToShow, setWishesToShow] = React.useState([]);
  const [wishToEdit, setWishToEdit] = React.useState<WishType | null>(null);

  React.useEffect(() => {
    if (wishes && !isLoading) {
      if (shouldHideDone) {
        setWishesToShow(wishes.filter((w: WishType) => !w.isDone));
      } else {
        setWishesToShow(wishes);
      }
    }
  }, [wishes, shouldHideDone, isLoading]);

  const removeWishMutation = useDeleteMutation(
    (id: string) => deleteWish(id),
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
      <Grid container spacing={2}>
        {wishesToShow.map((w: WishType) => {
          const isMine = true;
          return (
            <Grid key={w.id} item sx={{ width: { xs: '100%', sm: 400 } }}>
              <Card
                sx={{
                  border: (theme) =>
                    w.isDone
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
                    {w.priceFrom} - {w.priceTo} грн.
                  </Typography>
                  <Typography variant="caption">
                    {dayjs(w.createdAt).format('DD-MM-YYYY')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button onClick={() => openEditPopup(w)} disabled={!isMine}>
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      // @ts-ignore
                      editWishMutation.mutate({ id: w.id, ...w, isDone: true });
                    }}
                    disabled={!isMine || w.isDone}
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => {
                      // @ts-ignore
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
          // @ts-ignore
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
