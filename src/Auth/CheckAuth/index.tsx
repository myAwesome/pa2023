import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getItemFromStorage, TOKEN_KEY } from '../../shared/utils/storage';

const CheckAuth = ({ children }: PropsWithChildren) => {
  const [isOk, setIsOk] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    const token = getItemFromStorage(TOKEN_KEY);
    setIsOk(!!token);
  }, [location]);

  return isOk ? children : <Navigate to="/auth/login" />;
};

export default CheckAuth;
