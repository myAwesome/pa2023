import { createContext } from 'react';

type UIContextType = {
  error: string;
  setError: (e: string) => void;
};

const UIContext = createContext<UIContextType>({
  error: '',
  setError: () => {},
});

export default UIContext;
