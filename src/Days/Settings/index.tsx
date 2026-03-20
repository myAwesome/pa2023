import React from 'react';
import { Stack } from '@mui/material';
import LabelsSettings from './LabelsSettings';
import PeriodSettings from './PeriodSettings';
import PhotosSettings from './PhotosSettings';
import ThemeSettings from './ThemeSettings';
import AppsSettings from './AppsSettings';

const DaysSettings = () => {
  return (
    <Stack direction="column" gap={2}>
      <PhotosSettings />
      <LabelsSettings />
      <PeriodSettings />
      <ThemeSettings />
      <AppsSettings />
    </Stack>
  );
};

export default DaysSettings;
