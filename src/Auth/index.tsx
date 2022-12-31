import { Outlet, redirect } from 'react-router-dom';
import { getUser } from '../shared/api/routes';

export async function authLoader() {
  try {
    const auth = await getUser();
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
