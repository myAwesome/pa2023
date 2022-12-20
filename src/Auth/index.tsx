import { Outlet, useNavigation } from 'react-router-dom';

const AuthRoot = () => {
  const navigation = useNavigation();
  return (
    <div className={navigation.state === 'loading' ? 'loading' : ''}>
      <Outlet />
    </div>
  );
};

export default AuthRoot;
