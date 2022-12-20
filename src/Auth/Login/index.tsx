import { Form, redirect } from 'react-router-dom';
import { ActionFunctionArgs } from '@remix-run/router/utils';
import React, { useCallback, useState } from 'react';
import { apiLogin } from '../../api';

export async function loginAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  // @ts-ignore
  await apiLogin(credentials.email, credentials.password);
  return redirect(`/`);
}
const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  return (
    <div>
      <p>Login page</p>
      <Form method="post">
        <input name="email" value={form.email} onChange={handleChange} />
        <input name="password" value={form.password} onChange={handleChange} />
        <button>Submit</button>
      </Form>
    </div>
  );
};

export default LoginPage;
