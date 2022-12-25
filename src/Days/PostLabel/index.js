import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const PostLabel = ({ isActive, label, onClick, noMargin }) => {
  return (
    <Box
      sx={{
        height: 22,
        width: 22,
        borderRadius: '50%',
        display: 'inline-flex',
        margin: noMargin ? '0' : '0 4px -6px',
        backgroundColor: 'white',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={label.name}
      style={{
        backgroundColor: isActive ? label.colorActive : label.color,
        color: isActive ? 'white' : 'black',
      }}
      onClick={(e) => onClick(e, isActive)}
    >
      {label.name.substr(0, 1)}
    </Box>
  );
};

PostLabel.propTypes = {
  isActive: PropTypes.bool,
  label: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    color: PropTypes.string,
    colorActive: PropTypes.string,
  }),
  classes: PropTypes.object,
  onClick: PropTypes.func,
  noMargin: PropTypes.bool,
};

export default PostLabel;
