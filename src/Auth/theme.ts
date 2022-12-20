import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#55b8d6',
    },
    secondary: {
      main: '#85197c',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
