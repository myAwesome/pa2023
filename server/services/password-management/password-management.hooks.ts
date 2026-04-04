import * as feathersAuthentication from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';

const { authenticate } = feathersAuthentication.hooks;

const requireAuthForChangePassword = async (context: HookContext) => {
  if (context.data?.action === 'change-password') {
    await authenticate('jwt')(context);
  }

  return context;
};

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [requireAuthForChangePassword],
    update: [],
    patch: [],
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
};
