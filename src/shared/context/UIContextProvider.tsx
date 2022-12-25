import { PropsWithChildren, useMemo, useState } from 'react';
import UIContext from './UIContext';

const UIContextProvider = ({ children }: PropsWithChildren) => {
  const [error, setError] = useState('');

  const uiContextValue = useMemo(
    () => ({
      error,
      setError,
    }),
    [error],
  );

  return (
    <UIContext.Provider value={uiContextValue}>{children}</UIContext.Provider>
  );
};

export default UIContextProvider;
