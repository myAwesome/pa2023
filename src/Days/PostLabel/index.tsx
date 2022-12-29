import React from 'react';
import { Box } from '@mui/material';
import { LabelType } from '../../shared/types';

type Props = {
  isActive: boolean;
  label: LabelType;
  onClick?: (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => void;
  noMargin?: boolean;
};

const PostLabel = ({ isActive, label, onClick, noMargin }: Props) => {
  return (
    <Box
      sx={{
        height: 22,
        width: 22,
        borderRadius: '50%',
        display: 'inline-flex',
        margin: noMargin ? '0' : '0 4px -6px',
        color: isActive ? 'white' : 'black',
        backgroundColor: isActive ? label.color_active : label.color,
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={label.name}
      onClick={(e) => onClick?.(e, isActive)}
    >
      {label.name?.substr(0, 1)}
    </Box>
  );
};

export default PostLabel;
