import { mapLabel, mapPeriod, mapPost } from '../utils/mappers';

export const POSTS_LOADED = '@post/POSTS_LOADED';
export const POSTS_HISTORY_LOADED = '@post/POSTS_HISTORY_LOADED';
export const LABELS_LOADED = '@post/LABELS_LOADED';
export const PERIODS_LOADED = '@post/PERIODS_LOADED';

const initialState = {
  posts: [],
  postsHistory: [],
  labels: [],
  periods: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case POSTS_LOADED: {
      const posts = action.payload.data.map(mapPost);
      return { ...state, posts };
    }
    case POSTS_HISTORY_LOADED: {
      const postsHistory = action.payload.data.map(mapPost);
      return { ...state, postsHistory };
    }
    case LABELS_LOADED: {
      const labels = action.payload.data.map(mapLabel);
      return { ...state, labels };
    }
    case PERIODS_LOADED:
      const periods = action.payload.data.map(mapPeriod);
      return { ...state, periods };
    default:
      return state;
  }
};

export default reducer;
