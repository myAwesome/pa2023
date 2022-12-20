import { Form, redirect } from 'react-router-dom';
import { ActionFunctionArgs } from '@remix-run/router/utils';
import React, { useCallback, useState } from 'react';
import { apiRegister } from '../../api';

export async function registrationAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  // @ts-ignore
  await apiRegister(credentials.email, credentials.password);
  return redirect(`/auth/login`);
}

const RegistrationPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  return (
    <div>
      <p>Registration Page</p>
      <Form method="post">
        <input name="email" value={form.email} onChange={handleChange} />
        <input name="password" value={form.password} onChange={handleChange} />
        <input
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <button disabled={form.password !== form.confirmPassword}>
          Submit
        </button>
      </Form>
    </div>
  );
};

export default RegistrationPage;
