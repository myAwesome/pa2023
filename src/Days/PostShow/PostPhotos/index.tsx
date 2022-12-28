import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import { Dialog, Grid, Typography, Box } from '@mui/material';
import GPhotosContext from '../../../shared/context/GPhotosContext';
import { getPhotosOnDate, photosSignIn } from '../../../shared/utils/photos';
import { PhotoType } from '../../../shared/types';

type Props = {
  date: number;
};

const PostPhotos = ({ date }: Props) => {
  const [photos, setPhotos] = React.useState<PhotoType[]>([]);
  const [isFetched, setFetched] = React.useState(false);
  const [showImg, setShowImg] = React.useState('');
  const {
    handleSignIn,
    value: { token: oauthToken },
  } = useContext(GPhotosContext);

  const getPhotos = () => {
    getPhotosOnDate(oauthToken, date)
      .then(async ({ photos, error }) => {
        setFetched(true);
        if (error) {
          if (error.code === 401) {
            const newToken = await photosSignIn(handleSignIn);
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
      <Dialog open={!!showImg} onClose={() => setShowImg('')}>
        <img
          src={showImg}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
          alt={date.toString()}
        />
      </Dialog>
    </Grid>
  );
};

export default PostPhotos;
