import { HookContext } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
import { removeUserId } from '../../app.hooks';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const filterArchived = (context: HookContext) => {
  context.params.query = {
    archived: 0,
    ...(context.params.query || {}),
  };
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [filterArchived],
    get: [],
    create: [removeUserId],
    update: [removeUserId],
    patch: [removeUserId],
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
