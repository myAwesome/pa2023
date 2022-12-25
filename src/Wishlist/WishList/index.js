import React from 'react';
import PropTypes from 'prop-types';
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

const WishList = () => {
  const { data: wishes, isLoading } = useQuery(['wishes'], getWishes);
  const [showImg, setShowImg] = React.useState(null);
  const [shouldHideDone, setHideDone] = React.useState(true);
  const [wishesToShow, setWishesToShow] = React.useState([]);

  React.useEffect(() => {
    if (wishes && !isLoading) {
      if (shouldHideDone) {
        setWishesToShow(wishes.filter((w) => !w.isDone));
      } else {
        setWishesToShow(wishes);
      }
    }
  }, [wishes, shouldHideDone, isLoading]);

  const removeWishMutation = useDeleteMutation(
    (id) => deleteWish(id),
    ['wishes'],
  );

  const [wishToEdit, setWishToEdit] = React.useState(null);

  const editWishMutation = useUpdateMutation(
    ({ id, ...values }) => putWish(id, values),
    ['wishes'],
    'id-from-payload',
    ({ id, ...values }) => ({ id, ...values }),
  );

  const openEditPopup = (w) => {
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
        {wishesToShow.map((w) => {
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
                    onClick={() =>
                      editWishMutation.mutate({ id: w.id, ...w, isDone: true })
                    }
                    disabled={!isMine || w.isDone}
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => removeWishMutation.mutate(w.id)}
                    disabled={!isMine}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        <Dialog open={!!showImg} onClose={() => setShowImg(null)}>
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
        onSubmit={editWishMutation.mutate}
        handleClose={handleCloseEdit}
        isOpen={!!wishToEdit}
        wish={wishToEdit}
      />
    </div>
  );
};

WishList.propTypes = {
  wishes: PropTypes.array,
  editWish: PropTypes.func,
  openEditPopup: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default WishList;
