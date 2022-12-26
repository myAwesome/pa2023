import React, { useContext } from 'react';
import { Avatar, Grid, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { photosSignIn, photosVerifyToken } from '../../../shared/utils/photos';
import GPhotosContext from '../../../shared/context/GPhotosContext';

const PhotosSettings = () => {
  const {
    handleSignIn,
    handleSignOut,
    value: googleUser,
  } = useContext(GPhotosContext);

  React.useEffect(() => {
    photosVerifyToken(googleUser, handleSignOut);
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
              <Button onClick={() => photosSignIn(handleSignIn)}>
                Change user
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Button onClick={() => photosSignIn(handleSignIn)}>
            Connect to Google Photos
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default PhotosSettings;
