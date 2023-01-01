import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import { getItemFromStorage, setItemToStorage } from '../utils/storage';
import { themeConfig } from '../config/theme';
import { Theme } from '../types';
import UIContext from './UIContext';

const UIContextProvider = ({ children }: PropsWithChildren) => {
  const cachedTheme = getItemFromStorage('theme_name');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [error, setError] = useState('');
  const [themeName, setThemeName] = useState<Theme>(
    cachedTheme && Object.values(Theme).includes(cachedTheme as Theme)
      ? (cachedTheme as Theme)
      : Theme.SYSTEM,
  );
  const resolvedSystemTheme = useMemo(
    () => (prefersDarkMode ? Theme.DARK : Theme.LIGHT),
    [prefersDarkMode],
  );
  const resolvedThemeName = useMemo(
    () =>
      themeName === Theme.SYSTEM
        ? resolvedSystemTheme
        : themeName === Theme.DARK
        ? Theme.DARK
        : Theme.LIGHT,
    [themeName, resolvedSystemTheme],
  );
  const userTheme = useMemo(
    () => createTheme(themeConfig(resolvedThemeName)),
    [themeName],
  );

  const handleUserThemeChanged = useCallback((newTheme: Theme) => {
    setItemToStorage('theme_name', newTheme);
    setThemeName(newTheme);
  }, []);

  const uiContextValue = useMemo(
    () => ({
      error,
      setError,
      userTheme: themeName,
      handleUserThemeChanged,
    }),
    [error, themeName, handleUserThemeChanged],
  );

  return (
    <UIContext.Provider value={uiContextValue}>
      <ThemeProvider theme={userTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </UIContext.Provider>
  );
};

export default UIContextProvider;
