import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { colorPairs } from '../../utils/colors';

const ColorPicker = ({ value, onChange }) => {
  return (
    <Grid container direction="column" spacing={1}>
      {colorPairs.map((row) => (
        <Grid item container spacing={1}>
          {row.map((c) => (
            <Grid item>
              <div
                onClick={() => onChange(c)}
                style={{
                  borderTop: `15px solid ${c[0]}`,
                  borderRight: `15px solid ${c[0]}`,
                  borderBottom: `15px solid ${c[1]}`,
                  borderLeft: `15px solid ${c[1]}`,
                  outline: value[0] === c[0] ? '3px double white' : null,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  );
};

ColorPicker.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};

export default ColorPicker;
