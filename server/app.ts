import path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import feathers, {
  HookContext as FeathersHookContext,
} from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';

import { Application } from './declarations';
import logger from './logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
import authentication from './authentication';
import knex from './knex';
// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());
export type HookContext<T = any> = {
  app: Application;
} & FeathersHookContext<T>;

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());
app.use(compress() as any);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')) as any);
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());

app.configure(knex);

// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.ts`)
app.configure(services);
// Set up event channels (see channels.ts)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use((error: any, req: any, _res: any, next: any) => {
  logger.error('Request failed: %s %s', req.method, req.originalUrl);
  logger.error(
    'Error summary: name=%s code=%s message=%s',
    error?.name,
    error?.code,
    error?.message,
  );

  if (error?.data) {
    logger.error('Error data: %o', error.data);
  }
  if (error?.errors) {
    logger.error('Error details: %o', error.errors);
  }
  if (error?.original) {
    logger.error('Original error: %o', error.original);
  }
  if (error?.stack) {
    logger.error('Stack: %s', error.stack);
  }

  next(error);
});
app.use(express.errorHandler({ logger } as any));

app.hooks(appHooks);

export default app;
