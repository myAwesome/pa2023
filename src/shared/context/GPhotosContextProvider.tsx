import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  clearStorage,
  getItemFromStorage,
  removeItemFromStorage,
  setItemToStorage,
} from '../utils/storage';
import GPhotosContext, { GPhotosContextValue } from './GPhotosContext';

const GPhotosContextProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState({
    isLoggedIn: !!getItemFromStorage('oauth_token'),
    name: getItemFromStorage('name') || '',
    imageUrl: getItemFromStorage('imageUrl') || '',
    token: getItemFromStorage('oauth_token') || '',
    expiresAt: getItemFromStorage('token_expiration') || '',
  });
  const navigate = useNavigate();

  const handleSignIn = useCallback(
    (user: Omit<GPhotosContextValue, 'isLoggedIn'>) => {
      setItemToStorage('name', user.name);
      setItemToStorage('imageUrl', user.imageUrl);
      setItemToStorage('oauth_token', user.token);
      setItemToStorage('token_expiration', user.expiresAt);
      setValue({
        ...user,
        isLoggedIn: true,
      });
    },
    [],
  );

  const handleSignOut = useCallback(() => {
    removeItemFromStorage('name');
    removeItemFromStorage('imageUrl');
    removeItemFromStorage('oauth_token');
    removeItemFromStorage('token_expiration');
    setValue({
      isLoggedIn: false,
      name: '',
      imageUrl: '',
      token: '',
      expiresAt: '',
    });
  }, []);

  const handleUserLoggedOut = useCallback(() => {
    setValue({
      isLoggedIn: false,
      name: '',
      imageUrl: '',
      token: '',
      expiresAt: '',
    });
    clearStorage();
    navigate('/auth/login');
  }, []);

  const gPhotosContextValue = useMemo(
    () => ({
      value,
      setValue,
      handleSignIn,
      handleSignOut,
      handleUserLoggedOut,
    }),
    [value, handleSignIn, handleSignOut, handleUserLoggedOut],
  );

  return (
    <GPhotosContext.Provider value={gPhotosContextValue}>
      {children}
    </GPhotosContext.Provider>
  );
};

export default GPhotosContextProvider;
