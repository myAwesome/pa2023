import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { editUser, getUser } from '../../../shared/api/routes';
import {
  ALL_APP_KEYS,
  AppKey,
  parseUserApps,
} from '../../../shared/hooks/useUserApps';

const APP_LABELS: Record<AppKey, string> = {
  days: 'Days',
  projects: 'Projects',
  'last-time': 'Last Time',
  countdown: 'Countdown',
  notes: 'Notes',
  watch: 'Watch',
  'world-map': 'World Map',
  transactions: 'Transactions',
  wishlist: 'Wishlist',
};

const AppsSettings = () => {
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
  const enabledApps = parseUserApps(userData?.apps);

  const { mutate } = useMutation({
    mutationFn: (apps: AppKey[]) => editUser({ apps: JSON.stringify(apps) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleToggle = (key: AppKey) => {
    const next = enabledApps.includes(key)
      ? enabledApps.filter((k) => k !== key)
      : [...enabledApps, key];
    mutate(next);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Apps
      </Typography>
      <FormGroup>
        {ALL_APP_KEYS.map((key) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={enabledApps.includes(key)}
                onChange={() => handleToggle(key)}
                size="small"
              />
            }
            label={APP_LABELS[key]}
          />
        ))}
      </FormGroup>
    </Paper>
  );
};

export default AppsSettings;
