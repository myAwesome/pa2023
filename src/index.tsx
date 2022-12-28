import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, Button, Typography, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import theme from './shared/config/theme';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const queryClient = new QueryClient();

/*
 * TODO:
 * use react-router instead of react-query?
 * toggle light-dark mode
 * do redesign
 * */

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  </React.StrictMode>,
);

serviceWorkerRegistration.register({
  onUpdate: (registration: ServiceWorkerRegistration) => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        // @ts-ignore
        if (event.target && event.target.state === 'activated') {
          window.location.reload();
        }
      });
      const messageNode = document.querySelector('#message');
      const handleClick = () => {
        waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      };
      if (messageNode) {
        const root = createRoot(messageNode);
        root.render(
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div>
              <Typography>Update is available.</Typography>
              <Button onClick={handleClick} variant="contained" fullWidth>
                Reload
              </Button>
            </div>
          </ThemeProvider>,
        );
        messageNode.className = 'root-message';
      }
    }
  },
});

reportWebVitals();
