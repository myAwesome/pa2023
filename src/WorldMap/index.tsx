import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Button,
  Dialog,
  Grid,
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import GPhotosContext from '../shared/context/GPhotosContext';
import { getPhotosOnDate, photosSignIn } from '../shared/utils/photos';
import { getPeriods } from '../shared/api/routes';
import { PeriodType, PhotoType } from '../shared/types';
import citiesList from './citiesList.json';
import countriesList from './countriesList.json';

const getDays = (periods: PeriodType[]) => {
  return periods.reduce(
    (prev, curr) => prev + dayjs(curr.end).diff(curr.start, 'days') + 1,
    0,
  );
};

const getColor = (periods: PeriodType[]) => {
  if (!periods.length) {
    return '#EBECED';
  }
  const days = getDays(periods);
  if (days) {
    if (days <= 3) {
      return '#91a280';
    } else if (days > 3 && days <= 12) {
      return '#829a6b';
    } else if (days > 12 && days <= 27) {
      return '#67814e';
    } else if (days > 27 && days <= 60) {
      return '#4d6733';
    } else if (days > 60) {
      return '#354b1e';
    }
  }
  return '#EBECED';
};

function WorldMap() {
  const [showCountry, setShowCountry] = React.useState<PeriodType[] | null>(
    null,
  );
  const [photos, setPhotos] = React.useState<PhotoType[]>([]);
  const [isFetched, setFetched] = React.useState(false);
  const [showImg, setShowImg] = React.useState('');
  const [nextPageToken, setNextPageToken] = React.useState();
  const {
    handleSignIn,
    value: { token: oauthToken },
  } = useContext(GPhotosContext);

  const periodsData = useQuery(['periods'], getPeriods, { initialData: [] });

  const visitedCities = React.useMemo(
    () =>
      citiesList.filter((c) =>
        periodsData.data?.find((d: PeriodType) =>
          d.name.toLowerCase().includes(c.id.toLowerCase()),
        ),
      ),
    [periodsData.data],
  );

  const onCountryClick = (periods: PeriodType[]) => {
    setPhotos([]);
    setNextPageToken(undefined);
    setFetched(false);
    getPhotosOnDate(oauthToken, null, periods).then(
      async ({ photos, error }) => {
        setFetched(true);
        if (error) {
          if (error.code === 401) {
            const newToken = await photosSignIn(handleSignIn);
            getPhotosOnDate(newToken, null, periods)
              .then(({ photos }) => {
                if (photos?.mediaItems) {
                  setPhotos(photos.mediaItems);
                  setNextPageToken(photos?.nextPageToken);
                }
              })
              .catch(console.log);
          }
        }
        if (photos?.mediaItems) {
          setPhotos(photos.mediaItems);
          setNextPageToken(photos?.nextPageToken);
        }
      },
    );
    setShowCountry(periods);
  };

  const onNextPageClick = () => {
    getPhotosOnDate(oauthToken, null, showCountry, nextPageToken)
      .then(({ photos }) => {
        if (photos?.mediaItems) {
          setPhotos((prev) => [...prev, ...photos.mediaItems]);
          setNextPageToken(photos?.nextPageToken);
        }
      })
      .catch(console.log);
  };

  return (
    <div>
      <style>{`.visited-country:hover {stroke: #f00;stroke-width: 2;} #map path {stroke: #999;}`}</style>
      <svg id="map" version="1.1" viewBox="0 0 1000 500">
        <defs>
          <linearGradient id="ukraine-flag" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: 'rgb(0, 87, 183)', stopOpacity: 1 }}
            ></stop>
            <stop
              offset="45%"
              style={{ stopColor: 'rgb(0, 87, 183)', stopOpacity: 1 }}
            ></stop>
            <stop
              offset="45%"
              style={{ stopColor: 'rgb(255, 215, 0)', stopOpacity: 1 }}
            ></stop>
            <stop
              offset="100%"
              style={{ stopColor: 'rgb(255, 215, 0)', stopOpacity: 1 }}
            ></stop>
          </linearGradient>
        </defs>
        <g id="countries">
          {countriesList.map((c) => {
            const periods = periodsData.data?.filter((p: PeriodType) =>
              p.name.toLowerCase().includes(c.country_name.toLowerCase()),
            );
            return (
              <path
                key={c.index}
                id={c.index}
                vectorEffect="non-scaling-stroke"
                fill={c.fill || getColor(periods)}
                d={c.d}
                className={!!periods.length ? 'visited-country' : ''}
                onClick={() => onCountryClick(periods)}
              >
                <title>
                  {c.country_name} ({getDays(periods)} days)
                </title>
              </path>
            );
          })}
        </g>
        {visitedCities.map((c) => (
          <circle
            id={c.id}
            key={c.id}
            cx={c.cx}
            cy={c.cy}
            r="3"
            stroke="orange"
            fill="yellow"
          >
            <title>{c.id}</title>
          </circle>
        ))}
      </svg>
      <Dialog open={!!showCountry} onClose={() => setShowCountry(null)}>
        <Box
          sx={{
            padding: (theme) => theme.spacing(1),
          }}
        >
          {showCountry?.map((p) => (
            <Typography
              variant="subtitle1"
              align="center"
              key={p.name + p.start}
            >
              {p.name} ({dayjs(p.start).format('DD/MM/YYYY')} -{' '}
              {dayjs(p.end).format('DD/MM/YYYY')})
            </Typography>
          ))}
          {!isFetched && <LinearProgress />}
          {isFetched && !photos.length ? (
            <Typography>No photos found...</Typography>
          ) : (
            <Grid container spacing={1} justifyContent="center">
              {photos.map((p) => (
                <Grid item key={p.id}>
                  <Box
                    sx={{
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: 150,
                      height: 150,
                      cursor: 'pointer',
                      backgroundImage: `url(${p.baseUrl})`,
                    }}
                    onClick={() => setShowImg(p.baseUrl)}
                    title={p.mediaMetadata?.creationTime}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          {nextPageToken ? (
            <Button
              onClick={onNextPageClick}
              variant="outlined"
              sx={{
                width: '70%',
                margin: (theme) => `${theme.spacing(1)}px auto`,
                display: 'block',
              }}
            >
              Get more
            </Button>
          ) : null}
        </Box>
      </Dialog>
      <Dialog open={!!showImg} onClose={() => setShowImg('')} maxWidth="lg">
        <img
          src={showImg}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        />
      </Dialog>
    </div>
  );
}

export default WorldMap;
