import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

const PhotosSettings = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6">Media Source:</Typography>
        <Typography>
          Photos and videos are loaded from the configured S3 bucket via the
          <code> /media </code>
          API.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default PhotosSettings;
