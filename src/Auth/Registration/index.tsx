import { Form, Link, redirect } from 'react-router-dom';
import { ActionFunctionArgs } from '@remix-run/router/utils';
import React, { useCallback, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link as MUILink,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Form method="post">
          <Box sx={{ mt: 1 }}>
            <TextField
              value={form.email}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              name="password"
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
              id="password"
              autoComplete="new-password"
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              id="confirm-password"
              autoComplete="new-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={
                !form.email ||
                !form.password ||
                form.password !== form.confirmPassword
              }
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container>
              <Grid item>
                <MUILink variant="body2" component={Link} to="/auth/login">
                  Already have an account? Sign in
                </MUILink>
              </Grid>
            </Grid>
          </Box>
        </Form>
      </Box>
    </Container>
  );
};

export default RegistrationPage;
