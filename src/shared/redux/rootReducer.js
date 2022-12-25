import { combineReducers } from 'redux';
import { createTheme } from '@mui/material';
import photos from './photosReducer';

export const SET_USER_THEME = '@root/SET_USER_THEME';

const initialState = {
  userTheme: localStorage.getItem('theme')
    ? createTheme(JSON.parse(localStorage.getItem('theme') || '{}'))
    : {},
  rawUserTheme: JSON.parse(localStorage.getItem('theme') || '{}'),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
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
  photos,
});

export default rootReducer;
