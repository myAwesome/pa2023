import React, { ReactNode, useContext } from 'react';
import Button from '@mui/material/Button';
import { Dialog, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GPhotosContext from '../../../shared/context/GPhotosContext';
import {
  deleteMediaByKey,
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

const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.m4v',
  '.3gp',
  '.mkv',
  '.webm',
];

const isVideoMedia = (photo: PhotoType) => {
  const key = (photo?.id || '').toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => key.endsWith(ext));
};

const PostPhotos = ({
  date,
  hideGetPhotosButton = false,
  extraAction,
}: Props) => {
  const [photos, setPhotos] = React.useState<PhotoType[]>([]);
  const [isFetched, setFetched] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
  const [isUploading, setUploading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<PhotoType | null>(
    null,
  );
  const [isDeleting, setDeleting] = React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const {
    value: { token: oauthToken },
  } = useContext(GPhotosContext);
  const previewMedia =
    previewIndex !== null && previewIndex >= 0 && previewIndex < photos.length
      ? photos[previewIndex]
      : null;
  const previewType =
    previewMedia && isVideoMedia(previewMedia) ? 'video' : 'image';

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

  const showPreviousMedia = React.useCallback(() => {
    if (!photos.length) return;
    setPreviewIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const showNextMedia = React.useCallback(() => {
    if (!photos.length) return;
    setPreviewIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % photos.length;
    });
  }, [photos.length]);

  const confirmDeletePhoto = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      const { error } = await deleteMediaByKey(deleteTarget.id);
      if (error) {
        throw error;
      }
      setPhotos((prev) => prev.filter((photo) => photo.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.log(error);
    } finally {
      setDeleting(false);
    }
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
      const uploadTasks = Array.from(files).map(async (file) => {
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
      });
      const results = await Promise.allSettled(uploadTasks);
      const hasSuccess = results.some(
        (result) => result.status === 'fulfilled',
      );
      const hasFailure = results.some((result) => result.status === 'rejected');
      if (hasSuccess) {
        getPhotos();
      }
      if (hasFailure) {
        throw new Error('Some files failed to upload');
      }
    } catch (error) {
      console.log(error);
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  };

  React.useEffect(() => {
    if (previewIndex === null) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPreviousMedia();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNextMedia();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewIndex, showNextMedia, showPreviousMedia]);

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
        {!isFetched && !hideGetPhotosButton ? (
          <Button onClick={getPhotos}>GET PHOTOS</Button>
        ) : null}
        <Button onClick={handleUploadButtonClick} disabled={isUploading}>
          {isUploading ? 'UPLOADING...' : 'UPLOAD FILES'}
        </Button>
      </Grid>
      {isFetched && !photos.length ? (
        <Typography>No photos found...</Typography>
      ) : null}
      {isFetched && photos.length ? (
        <Grid container spacing={1}>
          {photos.map((p, index) => (
            <Grid key={p.id}>
              <Grid container direction="column" spacing={0.5}>
                <Grid>
                  <Box
                    sx={{
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: 70,
                      height: 70,
                      cursor: 'pointer',
                      backgroundImage: `url(${p.baseUrl})`,
                      position: 'relative',
                      borderRadius: 0.5,
                      overflow: 'hidden',
                    }}
                    onClick={() => setPreviewIndex(index)}
                  >
                    {isVideoMedia(p) ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        }}
                      >
                        <PlayArrowIcon
                          sx={{ color: '#fff', fontSize: 32 }}
                          aria-label="video"
                        />
                      </Box>
                    ) : null}
                  </Box>
                </Grid>
                <Grid>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget(p)}
                    disabled={isDeleting}
                  >
                    DELETE
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      ) : null}
      <Dialog
        open={previewIndex !== null}
        onClose={() => setPreviewIndex(null)}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100vh',
          }}
        >
          {photos.length > 1 ? (
            <Button
              onClick={showPreviousMedia}
              sx={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                borderRadius: 0,
                width: { xs: 56, sm: 80 },
                minWidth: 0,
                color: '#fff',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
              aria-label="Previous file"
            >
              <ChevronLeftIcon sx={{ fontSize: 40 }} />
            </Button>
          ) : null}
          {previewMedia ? (
            previewType === 'video' ? (
              <video
                src={previewMedia.baseUrl}
                controls
                autoPlay
                style={{
                  maxWidth: 'calc(100vw - 160px)',
                  maxHeight: '95vh',
                }}
              />
            ) : (
              <img
                src={previewMedia.baseUrl}
                style={{
                  maxWidth: 'calc(100vw - 160px)',
                  maxHeight: '95vh',
                  objectFit: 'contain',
                }}
                alt={date.toString()}
              />
            )
          ) : null}
          {photos.length > 1 ? (
            <Button
              onClick={showNextMedia}
              sx={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: 0,
                width: { xs: 56, sm: 80 },
                minWidth: 0,
                color: '#fff',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
              aria-label="Next file"
            >
              <ChevronRightIcon sx={{ fontSize: 40 }} />
            </Button>
          ) : null}
        </Box>
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <Box sx={{ padding: 2, maxWidth: 360 }}>
          <Typography sx={{ marginBottom: 1 }}>
            Delete this photo from storage?
          </Typography>
          <Grid container spacing={1} justifyContent="flex-end">
            <Grid>
              <Button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                CANCEL
              </Button>
            </Grid>
            <Grid>
              <Button
                color="error"
                onClick={confirmDeletePhoto}
                disabled={isDeleting}
              >
                {isDeleting ? 'DELETING...' : 'DELETE'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </Grid>
  );
};

export default PostPhotos;
