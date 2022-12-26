import { createContext } from 'react';

export type GPhotosContextValue = {
  isLoggedIn: boolean;
  name: string;
  imageUrl: string;
  token: string;
  expiresAt: string;
};

type GPhotosContext = {
  value: GPhotosContextValue;
  setValue: (v: GPhotosContextValue) => void;
  handleSignIn: (v: Omit<GPhotosContextValue, 'isLoggedIn'>) => void;
  handleSignOut: () => void;
  handleUserLoggedOut: () => void;
};

const GPhotosContext = createContext<GPhotosContext>({
  value: {
    isLoggedIn: !!localStorage.getItem('oauth_token'),
    name: localStorage.getItem('name') || '',
    imageUrl: localStorage.getItem('imageUrl') || '',
    token: localStorage.getItem('oauth_token') || '',
    expiresAt: localStorage.getItem('token_expiration') || '',
  },
  setValue: () => {},
  handleSignIn: () => {},
  handleSignOut: () => {},
  handleUserLoggedOut: () => {},
});

export default GPhotosContext;
