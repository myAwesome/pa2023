import React, { FormEvent, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
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
import InputAdornment from '@mui/material/InputAdornment';
import VisibleIcon from '@mui/icons-material/VisibilityOutlined';
import NotVisibleIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router';
import { sendRegistration } from '../../shared/api/routes';
import { setItemToStorage, TOKEN_KEY } from '../../shared/utils/storage';
import UIContext from '../../shared/context/UIContext';

const RegistrationPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  const { setError } = useContext(UIContext);
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
  const navigate = useNavigate();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.password === form.confirmPassword) {
      sendRegistration({
        email: form.email,
        password: form.password,
        theme: '{mode:"dark"}',
      })
        .then((resp) => {
          setItemToStorage(TOKEN_KEY, resp.data.Token);
          navigate('/days');
        })
        .catch((err) => {
          setError(err.message);
        });
    } else {
      setError("Passwords don't match!");
    }
  };

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
              type={visible ? 'text' : 'password'}
              fullWidth
              name="password"
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
              id="password"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {visible ? (
                      <NotVisibleIcon onClick={() => setVisible(false)} />
                    ) : (
                      <VisibleIcon onClick={() => setVisible(true)} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              type={visible2 ? 'text' : 'password'}
              fullWidth
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              id="confirm-password"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {visible2 ? (
                      <NotVisibleIcon onClick={() => setVisible2(false)} />
                    ) : (
                      <VisibleIcon onClick={() => setVisible2(true)} />
                    )}
                  </InputAdornment>
                ),
              }}
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
        </form>
      </Box>
    </Container>
  );
};

export default RegistrationPage;
