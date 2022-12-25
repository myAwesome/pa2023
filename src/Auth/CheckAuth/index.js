import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { getItemFromStorage, TOKEN_KEY } from '../../shared/utils/storage';

const CheckAuth = ({ children }) => {
  const [isOk, setIsOk] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    const token = getItemFromStorage(TOKEN_KEY);
    setIsOk(!!token);
  }, [location]);

  return isOk ? children : <Navigate to="/signin" />;
};

CheckAuth.propTypes = {
  children: PropTypes.any,
};

export default CheckAuth;
