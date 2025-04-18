import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#F50057',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@keyframes blink': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0,
            },
          },
        },
      },
    },
  },
});

export default theme; 