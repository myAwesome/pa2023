import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { createTheme } from '@mui/material';
import { getItemFromStorage, setItemToStorage } from '../utils/storage';
import UIContext from './UIContext';

const UIContextProvider = ({ children }: PropsWithChildren) => {
  const [error, setError] = useState('');
  const [userTheme, setUserTheme] = useState(
    getItemFromStorage('theme')
      ? createTheme(JSON.parse(getItemFromStorage('theme') || '{}'))
      : {},
  );
  const [rawUserTheme, setRawUserTheme] = useState(
    JSON.parse(getItemFromStorage('theme') || '{}'),
  );

  const handleUserThemeChanged = useCallback(
    (newTheme: Record<string, any>) => {
      setItemToStorage('theme', JSON.stringify(newTheme));
      setRawUserTheme(newTheme);
      setUserTheme(createTheme(newTheme));
    },
    [],
  );

  const uiContextValue = useMemo(
    () => ({
      error,
      setError,
      userTheme,
      rawUserTheme,
      handleUserThemeChanged,
    }),
    [error, userTheme, rawUserTheme, handleUserThemeChanged],
  );

  return (
    <UIContext.Provider value={uiContextValue}>{children}</UIContext.Provider>
  );
};

export default UIContextProvider;
