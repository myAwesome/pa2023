import { createContext } from 'react';
import { Theme } from '../types';

type UIContextType = {
  error: string;
  setError: (e: string) => void;
  userTheme: Theme;
  handleUserThemeChanged: (newTheme: Theme) => void;
};

const UIContext = createContext<UIContextType>({
  error: '',
  setError: () => {},
  userTheme: Theme.SYSTEM,
  handleUserThemeChanged: () => {},
});

export default UIContext;
