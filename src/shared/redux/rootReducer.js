import { combineReducers } from 'redux';
import { createTheme } from '@mui/material';
import post from './postReducer';
import projects from './projectsReducer';
import lastTime from './lastTimeReducer';
import transactions from './transactionsReducer';
import photos from './photosReducer';

export const SET_ERROR = '@root/SET_ERROR';
export const SET_USER_THEME = '@root/SET_USER_THEME';

const initialState = {
  error: null,
  userTheme: localStorage.getItem('theme')
    ? createTheme(JSON.parse(localStorage.getItem('theme') || '{}'))
    : {},
  rawUserTheme: JSON.parse(localStorage.getItem('theme') || '{}'),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ERROR:
      return { ...state, error: action.payload };
    case SET_USER_THEME:
      return {
        ...state,
        userTheme: createTheme(action.payload),
        rawUserTheme: action.payload,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  root: reducer,
  post,
  projects,
  lastTime,
  transactions,
  photos,
});

export default rootReducer;
