import React from 'react';
import LabelsSettings from './LabelsSettings';
import PeriodSettings from './PeriodSettings';
import PhotosSettings from './PhotosSettings';
import ThemeSettings from './ThemeSettings';

const DaysSettings = () => {
  return (
    <div>
      <PhotosSettings />
      <LabelsSettings />
      <PeriodSettings />
      <ThemeSettings />
    </div>
  );
};

export default DaysSettings;
