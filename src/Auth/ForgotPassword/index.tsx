import React, { FormEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { requestForgotPassword } from '../../shared/api/routes';
import { getApiErrorMessage } from '../../shared/api/error';
import UIContext from '../../shared/context/UIContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setError } = useContext(UIContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await requestForgotPassword(email);
      setMessage(response?.message || 'Password reset request created.');
      setResetToken(response?.resetToken || '');
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetLink = `/auth/reset-password?email=${encodeURIComponent(email)}${
    resetToken ? `&token=${encodeURIComponent(resetToken)}` : ''
  }`;

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
          Forgot password
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
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!email || isSubmitting}
            sx={{ mt: 2, mb: 2 }}
          >
            {isSubmitting ? 'Sending...' : 'Send reset instructions'}
          </Button>

          {!!message && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {message}
            </Typography>
          )}

          {!!resetToken && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Reset token: <strong>{resetToken}</strong>
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <MUILink variant="body2" component={Link} to="/auth/login">
              Back to sign in
            </MUILink>
            <MUILink variant="body2" component={Link} to={resetLink}>
              Go to reset form
            </MUILink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
