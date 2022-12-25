import { USER_SIGN_IN, GOOGLE_USER_SIGN_OUT } from '../redux/photosReducer';

export const getPhotosOnDate = async (
  authToken,
  date,
  ranges,
  nextPageToken,
) => {
  let photos = [];
  let error = null;
  try {
    const response = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems:search?access_token=${encodeURIComponent(
        authToken,
      )}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(nextPageToken ? { pageToken: nextPageToken } : {}),
          pageSize: '24',
          filters: {
            dateFilter: date
              ? {
                  dates: {
                    year: new Date(date).getFullYear(),
                    month: new Date(date).getMonth() + 1,
                    day: new Date(date).getDate(),
                  },
                }
              : {
                  ranges: ranges.map((r) => ({
                    startDate: {
                      year: new Date(r.start).getFullYear(),
                      month: new Date(r.start).getMonth() + 1,
                      day: new Date(r.start).getDate(),
                    },
                    endDate: {
                      year: new Date(r.end).getFullYear(),
                      month: new Date(r.end).getMonth() + 1,
                      day: new Date(r.end).getDate(),
                    },
                  })),
                },
          },
        }),
      },
    );
    const result = await response.json();
    if (result && !result.error) {
      photos = result;
    } else {
      error = result.error;
    }
  } catch (err) {
    error = err;
  }

  return { photos, error };
};

let client;

const getClient = (callback) => {
  if (client) {
    return client;
  }
  client = window.google.accounts.oauth2.initTokenClient({
    client_id: process.env.REACT_APP_OAUTH_ID,
    scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    callback,
  });
  return client;
};

export const photosSignIn = (dispatch) => {
  if (window.google) {
    return new Promise((resolve) => {
      let googleClient = getClient((tokenResponse) => {
        const access_token = tokenResponse.access_token;
        fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((resp) => resp.json())
          .then((resp) => {
            dispatch({
              type: USER_SIGN_IN,
              payload: {
                token: access_token,
                name: resp.name,
                imageUrl: resp.picture,
                expiresAt: Date.now() + tokenResponse.expires_in * 1000,
              },
            });
          })
          .catch(console.log);
        resolve(access_token);
      });
      googleClient.requestAccessToken();
    });
  } else {
    console.log('Google API not available');
  }
};

export const photosVerifyToken = async (googleUser, dispatch) => {
  if (!!googleUser?.token && Date.now() < googleUser.expiresAt) {
    return true;
  }
  dispatch({ type: GOOGLE_USER_SIGN_OUT });
};
