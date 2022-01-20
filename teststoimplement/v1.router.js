'use strict';

process.env.SECRET = 'toes';

const supertest = require('supertest');
const { server } = require('../src/server.js');
const { db } = require('../src/auth/models/index.js');

const mockRequest = supertest(server);

let users = {
  admin: { username: 'admin', password: 'test', role: 'admin' },
  editor: { username: 'editor', password: 'test', role: 'editor' },
  writer: { username: 'writer', password: 'test', role: 'writer' },
  user: { username: 'user', password: 'test', role: 'user' },
};

beforeAll(async () => {
  await db.sync();
});
afterAll(async () => {
  await db.drop();
});