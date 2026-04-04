import React, { ReactNode, useContext } from 'react';
import Button from '@mui/material/Button';
import { Dialog, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import GPhotosContext from '../../../shared/context/GPhotosContext';
import {
  getPhotosOnDate,
  initMediaUpload,
  uploadFileToPresignedUrl,
} from '../../../shared/utils/photos';
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
  const [isUploading, setUploading] = React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);
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

  const handleUploadButtonClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }
    setUploading(true);
    try {
      const parsedDate = new Date(date);
      const capturedAt = Number.isNaN(parsedDate.getTime())
        ? new Date().toISOString()
        : parsedDate.toISOString();
      for (const file of Array.from(files)) {
        const { data, error } = await initMediaUpload({
          filename: file.name,
          mimeType: file.type,
          capturedAt,
        });
        if (error || !data?.uploadUrl) {
          throw error || new Error('Upload init failed');
        }
        const uploadResult = await uploadFileToPresignedUrl({
          uploadUrl: data.uploadUrl,
          file,
          mimeType: file.type,
        });
        if (uploadResult.error) {
          throw uploadResult.error;
        }
      }
      getPhotos();
    } catch (error) {
      console.log(error);
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  };

  return (
    <Grid
      container
      direction="column"
      sx={{
        marginTop: (theme) => theme.spacing(1),
      }}
    >
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={handleFileSelected}
      />
      <Grid container spacing={1} alignItems="center">
        {extraAction ? <Box>{extraAction}</Box> : null}
        {!hideGetPhotosButton && !isFetched ? (
          <Button onClick={getPhotos}>GET PHOTOS</Button>
        ) : null}
        <Button onClick={handleUploadButtonClick} disabled={isUploading}>
          {isUploading ? 'UPLOADING...' : 'UPLOAD PHOTO'}
        </Button>
      </Grid>
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
