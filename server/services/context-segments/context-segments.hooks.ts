import { HooksObject } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
import { filterByUser } from '../../app.hooks';

const { authenticate } = authentication.hooks;

const withTimestamp = (context: any) => {
  const now = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  context.data = {
    ...context.data,
    updated_at: now,
    ...(context.method === 'create' ? { created_at: now } : {}),
  };
  return context;
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [filterByUser],
    get: [],
    create: [withTimestamp],
    update: [withTimestamp],
    patch: [withTimestamp],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
} as HooksObject;
