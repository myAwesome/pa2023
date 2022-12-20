import { Outlet, redirect, useNavigation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { apiGetAuth } from '../api';
import theme from './theme';

export async function authLoader() {
  const auth = await apiGetAuth();
  if (auth) {
    return redirect('/');
  }
  return true;
}
const AuthRoot = () => {
  const navigation = useNavigation();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={navigation.state === 'loading' ? 'loading' : ''}>
        <Outlet />
      </div>
    </ThemeProvider>
  );
};

export default AuthRoot;
