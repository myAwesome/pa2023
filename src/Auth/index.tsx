import { Outlet, redirect } from 'react-router-dom';
import { apiGetAuth } from '../api';

export async function authLoader() {
  try {
    const auth = await apiGetAuth();
    if (auth) {
      return redirect('/');
    }
    return true;
  } catch (err) {
    return true;
  }
}
const AuthRoot = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AuthRoot;
