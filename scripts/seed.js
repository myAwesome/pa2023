const config = require('config');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const SEED_USER_EMAIL = 'demo@gmail.com';
const SEED_USER_PASSWORD = '1111';

async function ensureUsersTable(db) {
  const exists = await db.schema.hasTable('users');
  if (exists) {
    const hasApps = await db.schema.hasColumn('users', 'apps');
    if (!hasApps) {
      await db.schema.table('users', (table) => {
        table.text('apps');
      });
    }
    return;
  }

  await db.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('email').unique();
    table.string('password');
    table.string('googleId');
    table.string('facebookId');
    table.string('firstname');
    table.string('lastname');
    table.integer('wish_group_id');
    table.integer('transaction_group_id');
    table.integer('project_group_id');
    table.string('theme');
    table.text('apps');
  });
}

async function ensurePostsTable(db) {
  const exists = await db.schema.hasTable('posts');
  if (exists) {
    return;
  }

  await db.schema.createTable('posts', (table) => {
    table.increments('id');
    table.string('body');
    table.datetime('date');
    table.integer('user_id');
  });
}

function buildSeedPosts(userId) {
  const now = new Date();
  return [
    {
      body: 'Seed post: project setup complete.',
      date: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      user_id: userId,
    },
    {
      body: 'Seed post: implemented first API endpoint.',
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      user_id: userId,
    },
    {
      body: 'Seed post: preparing release checklist.',
      date: now,
      user_id: userId,
    },
  ];
}

async function seed() {
  const mysqlConfig = config.get('mysql');
  const db = knex({
    client: mysqlConfig.client,
    connection: mysqlConfig.connection,
  });

  try {
    await ensureUsersTable(db);
    await ensurePostsTable(db);

    const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10);
    const seedUserPayload = {
      email: SEED_USER_EMAIL,
      password: passwordHash,
      firstname: 'Seed',
      lastname: 'User',
      theme: 'light',
      apps: JSON.stringify(['posts']),
    };

    const existingUser = await db('users')
      .where({ email: SEED_USER_EMAIL })
      .first();

    let userId;
    if (existingUser) {
      userId = existingUser.id;
      await db('users').where({ id: userId }).update(seedUserPayload);
    } else {
      const insertResult = await db('users').insert(seedUserPayload);
      userId = Array.isArray(insertResult) ? insertResult[0] : insertResult;
    }

    await db('posts').where({ user_id: userId }).del();
    await db('posts').insert(buildSeedPosts(userId));

    console.log('Seed complete');
    console.log(`User: ${SEED_USER_EMAIL}`);
    console.log(`Password: ${SEED_USER_PASSWORD}`);
  } finally {
    await db.destroy();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
