import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { Dialog, Grid, Typography, Box } from '@mui/material';
import { getPhotosOnDate, photosSignIn } from '../../../shared/utils/photos';

const PostPhotos = ({ oauthToken, date, dispatch }) => {
  const [photos, setPhotos] = React.useState([]);
  const [isFetched, setFetched] = React.useState(false);
  const [showImg, setShowImg] = React.useState(null);

  const getPhotos = () => {
    getPhotosOnDate(oauthToken, date)
      .then(async ({ photos, error }) => {
        setFetched(true);
        if (error) {
          if (error.code === 401) {
            const newToken = await photosSignIn(dispatch);
            getPhotosOnDate(newToken, date)
              .then(({ photos }) => {
                if (photos?.mediaItems) {
                  setPhotos(photos.mediaItems);
                }
              })
              .catch(console.log);
          }
        }
        if (photos?.mediaItems) {
          setPhotos(photos.mediaItems);
        }
      })
      .catch(console.log);
  };

  return (
    <Grid
      container
      sx={{
        margin: (theme) => theme.spacing(1),
      }}
    >
      {isFetched ? null : <Button onClick={getPhotos}>GET PHOTOS</Button>}
      {isFetched && !photos.length ? (
        <Typography>No photos found...</Typography>
      ) : null}
      {isFetched && photos.length ? (
        <Grid container spacing={1}>
          {photos.map((p) => (
            <Grid item key={p.id}>
              <Box
                sx={{
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: 70,
                  height: 70,
                  cursor: 'pointer',
                  backgroundImage: `url(${p.baseUrl})`,
                }}
                onClick={() => setShowImg(p.baseUrl)}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}
      <Dialog open={!!showImg} onClose={() => setShowImg(null)}>
        <img
          src={showImg}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
          alt={date}
        />
      </Dialog>
    </Grid>
  );
};

PostPhotos.propTypes = {
  dispatch: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  oauthToken: PropTypes.string.isRequired,
};

export default PostPhotos;
