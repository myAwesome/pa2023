import { createContext } from 'react';
import { Theme } from '@mui/material';

type UIContextType = {
  error: string;
  setError: (e: string) => void;
  userTheme: Theme | object;
  rawUserTheme: Record<string, any>;
  handleUserThemeChanged: (newTheme: Record<string, any>) => void;
};

const UIContext = createContext<UIContextType>({
  error: '',
  setError: () => {},
  userTheme: {},
  rawUserTheme: {},
  handleUserThemeChanged: () => {},
});

export default UIContext;
