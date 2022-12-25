import { SET_USER_THEME } from '../redux/rootReducer';
import * as api from './routes';

const safeAction = (action, callback) => {
  return action()
    .then(callback)
    .catch((err) => {
      console.log(err);
      if (err.message === 'Network Error') {
        // TODO: add custom logic for each route
        console.log('request will be synced later');
        return true;
      }
      throw err;
    });
};

export function getUser(dispatch) {
  return safeAction(
    api.getUser,
    (json) => {
      const theme = JSON.parse(json.data.theme || '{}') || {};
      localStorage.setItem('theme', JSON.stringify(theme));
      dispatch({ type: SET_USER_THEME, payload: theme });
    },
    dispatch,
  );
}

export function editUserAction(dispatch, { data }) {
  return safeAction(
    () => api.putUser(data),
    () => {
      if (data.theme) {
        localStorage.setItem('theme', data.theme);
        dispatch({ type: SET_USER_THEME, payload: JSON.parse(data.theme) });
      }
    },
    dispatch,
  );
}
