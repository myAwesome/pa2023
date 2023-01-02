import React, { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import UIContext from '../../../shared/context/UIContext';
import { editUser } from '../../../shared/api/routes';
import { Theme } from '../../../shared/types';

const ThemeSettings = () => {
  const { userTheme, handleUserThemeChanged } = useContext(UIContext);
  const queryClient = useQueryClient();
  const updateMutation = useMutation<any, any, string>(
    (theme) => {
      return editUser({ theme });
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries(['user']);
      },
    },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUserThemeChanged(e.target.value as Theme);
    updateMutation.mutate(e.target.value);
  };

  return (
    <Stack gap={2} direction="column">
      <Typography variant="h6">Theme:</Typography>
      <RadioGroup name="theme_name" value={userTheme} onChange={handleChange}>
        <FormControlLabel
          value={Theme.SYSTEM}
          control={<Radio />}
          label="System preference"
          labelPlacement="end"
        />
        <FormControlLabel
          value={Theme.LIGHT}
          control={<Radio />}
          label="Light"
          labelPlacement="end"
        />
        <FormControlLabel
          value={Theme.DARK}
          control={<Radio />}
          label="Dark"
          labelPlacement="end"
        />
      </RadioGroup>
    </Stack>
  );
};

export default ThemeSettings;
