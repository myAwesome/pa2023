import React, { FormEvent, useContext, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  Link as MUILink,
  TextField,
  Typography,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { resetForgotPassword } from '../../shared/api/routes';
import { getApiErrorMessage } from '../../shared/api/error';
import UIContext from '../../shared/context/UIContext';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setError } = useContext(UIContext);

  const passwordsMatch = useMemo(
    () => password === confirmPassword,
    [password, confirmPassword],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setError("Passwords don't match!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetForgotPassword({
        email,
        token,
        password,
      });
      setMessage(response?.message || 'Password has been reset successfully.');
      setError('');
      setTimeout(() => {
        navigate('/auth/login');
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
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
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset password
        </Typography>
        <Box
          component="form"
          sx={{ mt: 1, width: '100%' }}
          onSubmit={handleSubmit}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="token"
            label="Reset Token"
            name="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="confirm-password"
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={
              !email ||
              !token ||
              !password ||
              !confirmPassword ||
              !passwordsMatch ||
              isSubmitting
            }
            sx={{ mt: 2, mb: 2 }}
          >
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </Button>

          {!!message && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {message}
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <MUILink variant="body2" component={Link} to="/auth/login">
              Back to sign in
            </MUILink>
            <MUILink
              variant="body2"
              component={Link}
              to="/auth/forgot-password"
            >
              Request new token
            </MUILink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
