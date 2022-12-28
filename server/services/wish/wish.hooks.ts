import { HookContext } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const filterByGroup = async (context: HookContext) => {
  context.params.query = {
    ...(context.params.query || {}),
    group_id: context.params.user?.wish_group_id,
  };
};

const addGroup = async (context: HookContext) => {
  context.data.group_id = context.params.user?.wish_group_id;
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [filterByGroup],
    get: [],
    create: [addGroup],
    update: [addGroup],
    patch: [addGroup],
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
