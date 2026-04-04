import React, { ReactNode, useContext } from 'react';
import Button from '@mui/material/Button';
import { Dialog, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import GPhotosContext from '../../../shared/context/GPhotosContext';
import { getPhotosOnDate } from '../../../shared/utils/photos';
import { PhotoType } from '../../../shared/types';

type Props = {
  date: number | string;
  hideGetPhotosButton?: boolean;
  extraAction?: ReactNode;
};

const PostPhotos = ({
  date,
  hideGetPhotosButton = false,
  extraAction,
}: Props) => {
  const [photos, setPhotos] = React.useState<PhotoType[]>([]);
  const [isFetched, setFetched] = React.useState(false);
  const [showImg, setShowImg] = React.useState('');
  const {
    value: { token: oauthToken },
  } = useContext(GPhotosContext);

  const getPhotos = () => {
    getPhotosOnDate(oauthToken, date)
      .then(({ photos, error }) => {
        setFetched(true);
        if (error) {
          console.log(error);
          return;
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
        marginTop: (theme) => theme.spacing(1),
      }}
    >
      {extraAction ? <Box>{extraAction}</Box> : null}
      {!isFetched && !hideGetPhotosButton ? (
        <Button onClick={getPhotos}>GET PHOTOS</Button>
      ) : null}
      {isFetched && !photos.length ? (
        <Typography>No photos found...</Typography>
      ) : null}
      {isFetched && photos.length ? (
        <Grid container spacing={1}>
          {photos.map((p) => (
            <Grid key={p.id}>
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
