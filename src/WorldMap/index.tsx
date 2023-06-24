import React, {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Button,
  Dialog,
  Grid,
  Typography,
  LinearProgress,
  Box,
  Stack,
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

const initialTransformMatrix = [1, 0, 0, 1, 0, 0];
const transformMatrix = [1, 0, 0, 1, 0, 0];

function useDrag(
  { x, y }: { x: number; y: number },
  ref: MutableRefObject<SVGSVGElement | null>,
) {
  const [position, setPosition] = useState({ x, y });

  const startDrag = ({
    clientX: startX,
    clientY: startY,
  }: {
    clientX: number;
    clientY: number;
  }) => {
    const onMove = ({
      clientX,
      clientY,
    }: {
      clientX: number;
      clientY: number;
    }) => {
      setPosition({
        x: (position.x + clientX - startX) / 40,
        y: (position.y + clientY - startY) / 40,
      });
    };

    const onUp = () => {
      ref.current?.removeEventListener('mousemove', onMove);
      ref.current?.removeEventListener('mouseup', onUp);
    };
    ref.current?.addEventListener('mousemove', onMove);
    ref.current?.addEventListener('mouseup', onUp);
  };

  return {
    position,
    startDrag,
  };
}

function WorldMap() {
  const [showCountry, setShowCountry] = React.useState<PeriodType[] | null>(
    null,
  );
  const [photos, setPhotos] = React.useState<PhotoType[]>([]);
  const [isFetched, setFetched] = React.useState(false);
  const [showImg, setShowImg] = React.useState('');
  const [currZoom, setCurrZoom] = React.useState(1);
  const [nextPageToken, setNextPageToken] = React.useState();
  const {
    handleSignIn,
    value: { token: oauthToken },
  } = useContext(GPhotosContext);
  const svgRef = useRef<SVGSVGElement>(null);
  const matrixGroupRef = useRef<SVGSVGElement>(null);

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

  const setMatrix = () => {
    const newMatrix = 'matrix(' + transformMatrix.join(' ') + ')';
    matrixGroupRef.current?.setAttributeNS(null, 'transform', newMatrix);
  };

  const pan = (dx: number, dy: number) => {
    transformMatrix[4] += dx;
    transformMatrix[5] += dy;
    setMatrix();
  };

  const zoom = (scale: number) => {
    if (!svgRef.current) {
      return;
    }
    setCurrZoom((prev) => prev * scale);
    const viewbox = svgRef.current.getAttributeNS(null, 'viewBox')!.split(' ');
    const centerX = parseFloat(viewbox[2]) / 2;
    const centerY = parseFloat(viewbox[3]) / 2;
    transformMatrix.forEach((t, i) => {
      transformMatrix[i] *= scale;
    });

    transformMatrix[4] += (1 - scale) * centerX;
    transformMatrix[5] += (1 - scale) * centerY;
    setMatrix();
  };

  const reset = () => {
    transformMatrix.forEach((t, i) => {
      transformMatrix[i] = initialTransformMatrix[i];
    });
    setMatrix();
  };

  const { position, startDrag } = useDrag({ x: 0, y: 0 }, svgRef);

  useEffect(() => {
    pan(position.x, position.y);
  }, [position]);

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <style>{`.visited-country:hover {stroke: #f00;stroke-width: 2;} #map path {stroke: #999;}`}</style>
        <svg
          id="map"
          version="1.1"
          viewBox="0 0 1000 500"
          ref={svgRef}
          onMouseDown={startDrag}
        >
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
          <g
            id="matrix-group"
            transform="matrix(1 0 0 1 0 0)"
            ref={matrixGroupRef}
          >
            <g id="countries">
              {countriesList.map((c) => {
                const periods = periodsData.data?.filter((p: PeriodType) =>
                  new RegExp(`(?:^|\\W)${c.country_name}(?:$|\\W)`, 'ig').test(
                    p.name,
                  ),
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
                r={currZoom > 1.5 ? 1 : 3}
                stroke="orange"
                fill="yellow"
              >
                <title>{c.id}</title>
              </circle>
            ))}
          </g>
        </svg>
        <Stack
          direction="column"
          gap={1}
          style={{ position: 'absolute', bottom: 10, right: 10 }}
        >
          <Button
            variant="contained"
            onClick={() => zoom(1.25)}
            sx={{
              padding: 0.5,
              minWidth: '32px',
              fontSize: 21,
              lineHeight: '21px',
            }}
          >
            +
          </Button>
          <Button
            variant="contained"
            onClick={() => zoom(0.75)}
            sx={{
              padding: 0.5,
              minWidth: '32px',
              fontSize: 21,
              lineHeight: '21px',
            }}
          >
            -
          </Button>
          <Button
            variant="contained"
            onClick={reset}
            sx={{
              padding: 0.5,
              minWidth: '32px',
              fontSize: 21,
              lineHeight: '21px',
            }}
          >
            ↺
          </Button>
        </Stack>
      </div>
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
