import teal from '@mui/material/colors/teal';
import blue from '@mui/material/colors/blue';
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: teal[700],
      light: teal[500],
      dark: teal[900],
    },
    secondary: {
      main: blue[900],
      light: blue[500],
      dark: blue[900],
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        type: 'button',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
    },
  },
  typography: {
    fontSize: 14,
  },
});

export default theme;
