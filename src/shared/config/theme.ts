import { createTheme, Theme } from '@mui/material';
import { cyan, pink } from '@mui/material/colors';

export const themeConfig = (mode: 'dark' | 'light' = 'dark') => ({
  shape: {
    borderRadius: 0,
  },
  palette: {
    mode,
    primary: cyan,
    secondary: pink,
  },
  shadows: Array(25).fill('none') as Theme['shadows'],
  components: {
    MuiButton: {
      defaultProps: {
        type: 'button' as const,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard' as const,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid ' + (mode === 'light' ? '#ccc' : '#333'),
        },
      },
    },
  },
  typography: {
    fontSize: 14,
  },
});

const theme = createTheme(themeConfig('dark'));

export default theme;
