import React, { FormEvent, useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { changePassword } from '../../../shared/api/routes';
import { getApiErrorMessage } from '../../../shared/api/error';
import UIContext from '../../../shared/context/UIContext';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setError } = useContext(UIContext);

  const passwordsMatch = useMemo(
    () => newPassword === confirmPassword,
    [newPassword, confirmPassword],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!passwordsMatch) {
      setError("Passwords don't match!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      });
      setMessage(response?.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Security
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Change your account password.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              !passwordsMatch ||
              isSubmitting
            }
            sx={{ mt: 2 }}
          >
            {isSubmitting ? 'Updating...' : 'Change password'}
          </Button>

          {!!message && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
