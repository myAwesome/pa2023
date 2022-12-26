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

export function getUser(dispatch, handleUserThemeChanged) {
  return safeAction(
    api.getUser,
    (json) => {
      const theme = JSON.parse(json.data.theme || '{}') || {};
      handleUserThemeChanged(theme);
    },
    dispatch,
  );
}

export function editUserAction(dispatch, handleUserThemeChanged, { data }) {
  return safeAction(
    () => api.putUser(data),
    () => {
      if (data.theme) {
        handleUserThemeChanged(JSON.parse(data.theme));
      }
    },
    dispatch,
  );
}
