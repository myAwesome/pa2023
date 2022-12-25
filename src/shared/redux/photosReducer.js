import { clearStorage } from '../utils/storage';

export const USER_SIGN_IN = '@photos/USER_SIGN_IN';
export const GOOGLE_USER_SIGN_OUT = '@photos/GOOGLE_USER_SIGN_OUT';
export const USER_SIGN_OUT = '@photos/USER_SIGN_OUT';

const initialState = {
  isLoggedIn: !!localStorage.getItem('oauth_token'),
  name: localStorage.getItem('name'),
  imageUrl: localStorage.getItem('imageUrl'),
  token: localStorage.getItem('oauth_token'),
  expiresAt: localStorage.getItem('token_expiration'),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGN_IN:
      const user = action.payload;
      localStorage.setItem('name', user.name);
      localStorage.setItem('imageUrl', user.imageUrl);
      localStorage.setItem('oauth_token', user.token);
      localStorage.setItem('token_expiration', user.expiresAt);
      return {
        ...state,
        isLoggedIn: true,
        name: user.name,
        imageUrl: user.imageUrl,
        token: user.token,
        expiresAt: user.expiresAt,
      };
    case GOOGLE_USER_SIGN_OUT:
      localStorage.removeItem('name');
      localStorage.removeItem('imageUrl');
      localStorage.removeItem('oauth_token');
      localStorage.removeItem('token_expiration');
      return {}; // empty state
    case USER_SIGN_OUT:
      clearStorage();
      return {}; // empty state
    default:
      return state;
  }
};

export default reducer;
