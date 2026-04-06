import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const queryClient = new QueryClient();
let hasRefreshedOnUpdate = false;

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
      const messageNode = document.querySelector('#message');
      const handleClick = () => {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            if (!hasRefreshedOnUpdate) {
              hasRefreshedOnUpdate = true;
              window.location.reload();
            }
          },
          { once: true },
        );
        waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      };
      if (messageNode) {
        const root = createRoot(messageNode);
        root.render(
          <div>
            <Typography>Update is available.</Typography>
            <Button onClick={handleClick} variant="contained" fullWidth>
              Reload
            </Button>
          </div>,
        );
        messageNode.className = 'root-message';
      }
    }
  },
});

reportWebVitals();
