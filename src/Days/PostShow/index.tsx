import React, { FormEvent, Fragment } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
} from '@mui/material';
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import PostLabel from '../PostLabel';
import {
  addLabelToPost,
  deleteContextSegment,
  getContextSegments,
  getHistoricalWeather,
  patchContextSegment,
  deleteLabelFromPost,
  deletePost,
  editPost,
  splitContextSegment,
} from '../../shared/api/routes';
import { useUpdateMutation } from '../../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../../shared/hooks/useDeleteMutation';
import {
  ContextSegmentType,
  LabelType,
  PeriodType,
  PostType,
} from '../../shared/types';
import { dateToMySQLFormat } from '../../shared/utils/mappers';
import PostEdit from './PostEdit';
import PostComment from './PostComment';
import PostCommentEdit from './PostCommentEdit';
import PostPhotos from './PostPhotos';

dayjs.extend(utc);
dayjs.extend(relativeTime);

type Props = {
  post: PostType;
  labels: LabelType[];
  searchTerm?: string;
  invalidateQueries: QueryKey;
};

const toDateOnly = (value: string | Date) => dayjs(value).format('YYYY-MM-DD');

const weatherCodeToLabel = (code?: number) => {
  if (code == null) return 'Unknown';
  if (code === 0) return 'Clear';
  if ([1, 2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
  if ([71, 73, 75, 77].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([85, 86].includes(code)) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if ([96, 99].includes(code)) return 'Thunderstorm + hail';
  return `WMO ${code}`;
};

const parseLocationDetails = (details?: string | null) => {
  if (!details) {
    return null;
  }
  const [latRaw, lonRaw] = details.split(',').map((val) => val.trim());
  const latitude = Number(latRaw);
  const longitude = Number(lonRaw);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return { latitude, longitude };
};

const getPeriodDurationDays = (period: PeriodType) => {
  if (!period.start || !period.end) {
    return Number.POSITIVE_INFINITY;
  }
  const start = dayjs(period.start);
  const end = dayjs(period.end);
  if (!start.isValid() || !end.isValid()) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(end.diff(start, 'day'), 0);
};

const toOneDecimal = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '?';
};

const PostShow = ({ post, labels, searchTerm, invalidateQueries }: Props) => {
  const queryClient = useQueryClient();
  const [deleteMode, setDeletedMode] = React.useState(false);
  const [isCommentOpen, setCommentOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [selectedContext, setSelectedContext] =
    React.useState<ContextSegmentType | null>(null);
  const [title, setTitle] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [splitDate, setSplitDate] = React.useState('');
  const postDate = toDateOnly(post.date);
  const [updateDate, setUpdateDate] = React.useState(postDate);
  const contextByDate = useQuery(
    ['context_segments', post.id, postDate],
    () => getContextSegments({ date: postDate }),
    {
      enabled: !post.context_segments?.length && !!post.date,
    },
  );
  const deletePostMutation = useDeleteMutation(
    () => deletePost(post.id),
    invalidateQueries,
    post.id,
  );
  const toggleLabelMutation = useUpdateMutation(
    ({ isActive, labelId }: { isActive: boolean; labelId: number }) =>
      isActive
        ? deleteLabelFromPost(post.id, labelId)
        : addLabelToPost(post.id, labelId),
    invalidateQueries,
    post.id,
    (
      { isActive, labelId }: { isActive: boolean; labelId: number },
      post: PostType,
    ) => ({
      labels: isActive
        ? post.labels.filter((l) => l !== labelId)
        : post.labels.concat(labelId),
    }),
  );
  const editPostMutation = useUpdateMutation(
    (body: string) =>
      editPost(post.id, { body, date: dateToMySQLFormat(updateDate) }),
    invalidateQueries,
    post.id,
    (body: string) => ({
      body,
      date: dateToMySQLFormat(updateDate),
    }),
    () => setIsEdit(false),
  );
  const weatherMutation = useUpdateMutation(
    (weather: string) =>
      editPost(post.id, {
        body: post.body,
        date: dateToMySQLFormat(postDate),
        weather,
      }),
    invalidateQueries,
    post.id,
    (weather: string) => ({ weather }),
  );
  const refreshContextData = () => {
    queryClient.invalidateQueries(invalidateQueries);
    queryClient.invalidateQueries(['context_segments', post.id, postDate]);
  };
  const editContextMutation = useMutation(
    ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        details?: string;
        start_date?: string;
        end_date?: string | null;
      };
    }) => patchContextSegment(id, data),
    {
      onSuccess: () => {
        setSelectedContext(null);
        refreshContextData();
      },
    },
  );
  const splitContextMutation = useMutation(
    ({
      id,
      data,
    }: {
      id: number;
      data: {
        splitDate: string;
        newTitle?: string;
        newDetails?: string;
      };
    }) => splitContextSegment(id, data),
    {
      onSuccess: () => {
        setSelectedContext(null);
        refreshContextData();
      },
    },
  );
  const deleteContextMutation = useMutation(
    (id: number) => deleteContextSegment(id),
    {
      onSuccess: () => {
        setSelectedContext(null);
        refreshContextData();
      },
    },
  );

  const toggleDeleteMode = () => {
    setDeletedMode(!deleteMode);
  };

  const handleSubmit = (e: FormEvent, updateText: string) => {
    e.preventDefault();
    editPostMutation.mutate(updateText);
  };
  const toInputDate = (value?: string | null) =>
    value ? toDateOnly(value) : '';
  const openContextDialog = (segment: ContextSegmentType) => {
    setSelectedContext(segment);
    setTitle(segment.title || '');
    setDetails(segment.details || '');
    setStartDate(toInputDate(segment.start_date));
    setEndDate(toInputDate(segment.end_date));
    setSplitDate(postDate);
  };
  const handleEditContext = () => {
    if (!selectedContext || !title.trim()) {
      return;
    }
    if (endDate && endDate < startDate) {
      return;
    }
    editContextMutation.mutate({
      id: selectedContext.id,
      data: {
        title: title.trim(),
        details,
        start_date: startDate,
        end_date: endDate || null,
      },
    });
  };
  const handleSplitContext = () => {
    if (!selectedContext || !splitDate) {
      return;
    }
    splitContextMutation.mutate({
      id: selectedContext.id,
      data: {
        splitDate,
        newTitle: title.trim() || selectedContext.title,
        newDetails: details,
      },
    });
  };
  const handleDeleteContext = () => {
    if (!selectedContext) {
      return;
    }
    if (!window.confirm('Delete this context segment?')) {
      return;
    }
    deleteContextMutation.mutate(selectedContext.id);
  };
  const handleFetchWeather = async () => {
    const locationPeriods = (post.periods || [])
      .filter((period) => period.is_location)
      .filter((period) => parseLocationDetails(period.location_details));
    if (!locationPeriods.length) {
      return;
    }
    const shortestLocation = locationPeriods.reduce((shortest, current) => {
      return getPeriodDurationDays(current) < getPeriodDurationDays(shortest)
        ? current
        : shortest;
    });
    const location = parseLocationDetails(shortestLocation.location_details);
    if (!location) {
      return;
    }
    const weatherData = await getHistoricalWeather({
      latitude: location.latitude,
      longitude: location.longitude,
      date: postDate,
    });
    const code = weatherData?.daily?.weather_code?.[0];
    const tMax = weatherData?.daily?.temperature_2m_max?.[0];
    const tMin = weatherData?.daily?.temperature_2m_min?.[0];
    const precipitation = weatherData?.daily?.precipitation_sum?.[0];
    const summary = `${weatherCodeToLabel(code)} ${toOneDecimal(
      tMax,
    )}/${toOneDecimal(tMin)}C, rain ${toOneDecimal(precipitation)}mm`;
    weatherMutation.mutate(summary);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {' '}
        {parts.map((part, i) => (
          <Box
            component="span"
            key={i}
            sx={
              part.toLowerCase() === highlight.toLowerCase()
                ? {
                    backgroundColor: (theme) =>
                      theme.palette.secondary[theme.palette.mode],
                    borderRadius: '6px',
                    padding: '1px 3px',
                  }
                : {}
            }
          >
            {part}
          </Box>
        ))}{' '}
      </span>
    );
  };
  const contextSegments: ContextSegmentType[] = post.context_segments?.length
    ? post.context_segments
    : Array.isArray(contextByDate.data)
    ? (contextByDate.data as ContextSegmentType[])
    : Array.isArray((contextByDate.data as any)?.data)
    ? ((contextByDate.data as any).data as ContextSegmentType[])
    : [];

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Paper>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          gap={2}
          sx={{
            position: 'relative',
            top: -14,
          }}
        >
          <Grid
            item
            sx={{
              padding: (theme) => theme.spacing(0, 1),
            }}
            title={dayjs(post.date).fromNow(true)}
          >
            {isEdit ? (
              <TextField
                name="update Date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                type="date-local"
                sx={{
                  width: 140,
                }}
                size="small"
                variant="standard"
              />
            ) : (
              dayjs(postDate).format('dddd YYYY-MM-DD')
            )}
          </Grid>
          <Grid item>
            {labels.map((l) => (
              <PostLabel
                key={l.id}
                label={l}
                onClick={(e, isActive) =>
                  toggleLabelMutation.mutate({ isActive, labelId: l.id })
                }
                isActive={!!post.labels.find((pl) => pl === l.id)}
              />
            ))}
          </Grid>
          <Grid item gap={2}>
            <Button
              onClick={() => setIsEdit(true)}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 32,
              }}
              disabled={post.id === 0 || editPostMutation.isLoading}
            >
              edit
            </Button>
            <Button
              onClick={() => setCommentOpen(true)}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 32,
              }}
              disabled={post.id === 0 || editPostMutation.isLoading}
            >
              cmnt
            </Button>
            <Button
              onClick={toggleDeleteMode}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 32,
              }}
              disabled={post.id === 0 || editPostMutation.isLoading}
            >
              x
            </Button>
            <Button
              onClick={handleFetchWeather}
              color="inherit"
              sx={{
                textTransform: 'lowercase',
                padding: (theme) => theme.spacing(0, 1),
                minWidth: 40,
              }}
              disabled={
                post.id === 0 ||
                editPostMutation.isLoading ||
                weatherMutation.isLoading
              }
            >
              wthr
            </Button>
          </Grid>
        </Grid>

        {deleteMode ? (
          <Box
            sx={{
              margin: 'auto',
              minHeight: 70,
              width: '100%',
              textAlign: 'left',
              lineHeight: '150%',
              position: 'relative',
              padding: (theme) => theme.spacing(1.2),
              paddingTop: 0,
              marginTop: (theme) => theme.spacing(1.5),
            }}
          >
            <Box
              sx={{
                width: '95%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Button
                variant="contained"
                onClick={() => setDeletedMode(false)}
                sx={{
                  width: '40%',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={deletePostMutation.mutate}
                sx={{
                  width: '40%',
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              margin: 'auto',
              minHeight: 70,
              width: '100%',
              textAlign: 'left',
              lineHeight: '150%',
              position: 'relative',
              padding: (theme) => theme.spacing(1.2),
              paddingTop: 0,
              marginTop: (theme) => theme.spacing(1.5),
            }}
          >
            {isEdit ? (
              <PostEdit
                body={post.body}
                onCancel={() => setIsEdit(false)}
                handleSubmit={handleSubmit}
              />
            ) : (
              <p>
                {post.body.split('\n').map((item, key) => (
                  <Fragment key={key}>
                    {searchTerm ? getHighlightedText(item, searchTerm) : item}
                    <br />
                  </Fragment>
                ))}
              </p>
            )}
            {post.periods && post.periods.length > 0 ? (
              <Grid container flexWrap="wrap" gap={1}>
                {post.periods.map((period) => (
                  <Grid item key={period.id}>
                    <Chip
                      label={period.name}
                      sx={{
                        color: (theme) => theme.palette.primary.light,
                      }}
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            ) : null}
            {post.weather ? (
              <Grid container sx={{ marginTop: 1 }}>
                <Chip
                  label={post.weather}
                  variant="outlined"
                  sx={{
                    color: (theme) => theme.palette.secondary.main,
                  }}
                />
              </Grid>
            ) : null}
            {contextSegments.length > 0 ? (
              <Grid container flexWrap="wrap" gap={1} sx={{ marginTop: 1 }}>
                {contextSegments.map((segment) => (
                  <Grid item key={segment.id}>
                    <Chip
                      label={segment.title}
                      title={segment.details}
                      clickable
                      onClick={() => openContextDialog(segment)}
                      sx={{
                        borderColor: (theme) => theme.palette.primary.main,
                        color: (theme) => theme.palette.text.primary,
                        '&:hover': {
                          borderColor: (theme) => theme.palette.primary.main,
                        },
                      }}
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            ) : null}
            <PostPhotos date={post.date} />
            {post.comments.map((comment) => (
              <PostComment key={comment.id} comment={comment} />
            ))}
            {isCommentOpen ? (
              <PostCommentEdit
                postId={post.id}
                onCancel={() => {
                  setCommentOpen(false);
                }}
                invalidateQueries={invalidateQueries}
              />
            ) : (
              ''
            )}
            <Dialog
              open={!!selectedContext}
              onClose={() => setSelectedContext(null)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Context details</DialogTitle>
              <DialogContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    marginTop: 1,
                  }}
                >
                  <TextField
                    label="Title"
                    size="small"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <TextField
                    label="Details"
                    size="small"
                    multiline
                    minRows={2}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                  <TextField
                    label="Start date"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End date"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Split from date"
                    type="date"
                    size="small"
                    value={splitDate}
                    onChange={(e) => setSplitDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteContext} color="inherit">
                  Delete
                </Button>
                <Button onClick={handleSplitContext} color="inherit">
                  Split
                </Button>
                <Button onClick={handleEditContext} variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PostShow;
