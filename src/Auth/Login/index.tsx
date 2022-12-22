import { Form, Link, redirect } from 'react-router-dom';
import { ActionFunctionArgs } from '@remix-run/router/utils';
import React, { useCallback, useState } from 'react';
import {
  Button,
  Grid,
  TextField,
  Link as MUILink,
  Container,
  Box,
  Avatar,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
          Sign in
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
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item>
                <MUILink
                  component={Link}
                  variant="body2"
                  to="/auth/registration"
                >
                  Don&apos;t have an account? Sign Up
                </MUILink>
              </Grid>
            </Grid>
          </Box>
        </Form>
      </Box>
    </Container>
  );
};

export default LoginPage;
