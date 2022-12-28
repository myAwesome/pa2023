import { HookContext } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
const { authenticate } = authentication.hooks;
import { iffElse } from 'feathers-hooks-common';

const userHook = async (context: HookContext) => {
  if (context.service.options && context.service.options.userAware) {
    context.data.user_id = context.params.user?.id;
  }
};

export const filterByUser = async (context: HookContext) => {
  if (context.service.options && context.service.options.userAware) {
    context.params.query = {
      ...(context.params.query || {}),
      user_id: context.params.user?.id,
    };
  }
};

const resetLimit = async (context: HookContext) => {
  context.params.query = { $limit: 100, ...(context.params.query || {}) };
};

const isAuthenticateNeed = async (context: HookContext) => {
  return context.path !== 'authentication';
};

export default {
  before: {
    all: [iffElse(isAuthenticateNeed, [authenticate('jwt')], [])],
    find: [resetLimit],
    get: [],
    create: [userHook],
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
