import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import { themeConfig } from './shared/config/theme';
import { Theme } from './shared/types';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const queryClient = new QueryClient();

const resolveThemeName = (): Theme.DARK | Theme.LIGHT => {
  const cachedTheme = localStorage.getItem('theme_name');
  const selectedTheme =
    cachedTheme && Object.values(Theme).includes(cachedTheme as Theme)
      ? (cachedTheme as Theme)
      : Theme.SYSTEM;

  if (selectedTheme === Theme.SYSTEM) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.DARK
      : Theme.LIGHT;
  }

  return selectedTheme === Theme.DARK ? Theme.DARK : Theme.LIGHT;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>,
);

serviceWorkerRegistration.register({
  onUpdate: (registration: ServiceWorkerRegistration) => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        const target = event.target as ServiceWorker | null;
        if (target?.state === 'activated') {
          window.location.reload();
        }
      });
      const messageNode = document.querySelector('#message');
      const handleClick = () => {
        waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      };
      if (messageNode) {
        const root = createRoot(messageNode);
        const toastTheme = createTheme(themeConfig(resolveThemeName()));
        root.render(
          <ThemeProvider theme={toastTheme}>
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
