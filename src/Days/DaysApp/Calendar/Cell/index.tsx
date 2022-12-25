import React from 'react';
import { Box } from '@mui/material';
import PostLabel from '../../../PostLabel';
import { mapLabel } from '../../../../shared/utils/mappers';
import { LabelType } from '../../../../shared/types';

const CalendarCell = (
  row: Record<string, any>,
  col: { field: string | number },
) => {
  const data = row[col.field];
  return (
    <Box
      sx={{
        width: 75,
        height: 75,
        display: 'flex',
        position: 'relative',
        margin: '0 -10px',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: data.isEmpty ? 'pointer' : '',
      }}
      onClick={() => {
        window.location.hash = `#${data.id}`;
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -3,
          right: -3,
        }}
      >
        {data.date}
      </Box>
      {!data.isEmpty && (
        <div>
          {data.labels?.map((l: LabelType) => (
            <PostLabel key={l.ID} label={mapLabel(l)} isActive noMargin />
          ))}
        </div>
      )}
    </Box>
  );
};

export default CalendarCell;
