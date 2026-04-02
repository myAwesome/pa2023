# pa-2023

> Personal Asistant 2023

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.
2. Install your dependencies

    ```
    cd path/to/pa-2023
    pnpm install
    ```

3. Start your app

    ```
    pnpm run dev
    ```

## Client Commands

- `pnpm run dev-client` starts Vite dev server.
- `pnpm run build-client` creates the production client in `dist/`.
- `pnpm run preview-client` serves the built client locally.

## Environment Variables

- `VITE_API_URL` overrides API base URL (default `/api`).
- `VITE_OAUTH_ID` sets Google OAuth client ID.
- `REACT_APP_API_URL` and `REACT_APP_OAUTH_ID` are still supported as fallback during migration.

## Testing

Simply run `pnpm run jest` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Server

docker-compose up -d
pm2 resurrect (or start_frontend.sh and backend/lib/index.js)
