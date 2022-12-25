import React, { useCallback, useState, useContext, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  TextField,
  Button,
  Container,
  Box,
  Avatar,
  Typography,
  Link as MUILink,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router';
import { sendLogin } from '../../shared/api/routes';
import { setItemToStorage, TOKEN_KEY } from '../../shared/utils/storage';
import UIContext from '../../shared/context/UIContext';

const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { setError } = useContext(UIContext);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendLogin(form)
      .then((resp) => {
        setItemToStorage(TOKEN_KEY, resp.data.Token);
        navigate('/days');
      })
      .catch((err) => {
        setError(err.message);
      });
  };

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
        <form onSubmit={handleSubmit}>
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
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
