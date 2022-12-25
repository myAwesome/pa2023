import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, Grid, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { photosSignIn, photosVerifyToken } from '../../../shared/utils/photos';

const PhotosSettings = () => {
  const googleUser = useSelector((state) => state.photos);
  const dispatch = useDispatch();

  React.useState(() => {
    photosVerifyToken(googleUser, dispatch);
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Google Photos:</Typography>
        {googleUser.isLoggedIn ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>Logged in as:</Typography>
            </Grid>
            <Grid item container xs={12} spacing={1} alignItems="center">
              <Grid item>
                <Avatar src={googleUser.imageUrl} alt={googleUser.name} />
              </Grid>
              <Grid item>
                <Typography>{googleUser.name}</Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={() => photosSignIn(dispatch)}>
                Change user
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Button onClick={() => photosSignIn(dispatch)}>
            Connect to Google Photos
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default PhotosSettings;
