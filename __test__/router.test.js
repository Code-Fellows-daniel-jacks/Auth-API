'use strict';

process.env.SECRET = 'toes';

const supertest = require('supertest');
const { server } = require('../src/server.js');
const { db } = require('../src/auth/models/index.js');

const mockRequest = supertest(server);

let users = {
  editor: { username: 'editor', password: 'test', role: 'editor' },
  writer: { username: 'writer', password: 'test', role: 'writer' },
  user: { username: 'user', password: 'test', role: 'user' },
  admin: { username: 'admin', password: 'test', role: 'admin' },
};

let v1models = {
  food: { name: 'test', calories: 25, type: 'test' },
  clothes: { name: 'test', color: 'blue', size: 'test' },
};

let v2models = {
  food: { name: 'test', calories: 25, type: 'test' },
  clothes: { name: 'test', color: 'blue', size: 'test' },
};

beforeAll(async () => {
  await db.sync();
});
afterAll(async () => {
  await db.drop();
});

describe('Auth Router', () => {

  Object.keys(users).forEach(userType => {

    describe(`${userType} users`, () => {

      it('can create one', async (done) => {

        const response = await mockRequest.post('/signup').send(users[userType]);
        const userObject = response.body;

        expect(response.status).toBe(201);
        expect(userObject.token).toBeDefined();
        expect(userObject.user.id).toBeDefined();
        expect(userObject.user.username).toEqual(users[userType].username);
        done();
      });

      it('can signin with basic', async (done) => {

        const response = await mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password);

        const userObject = response.body;
        expect(response.status).toBe(200);
        expect(userObject.token).toBeDefined();
        expect(userObject.user.id).toBeDefined();
        expect(userObject.user.username).toEqual(users[userType].username);
        done();
      });

      it('can signin with bearer', async (done) => {

        // First, use basic to login to get a token
        const response = await mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password);

        const token = response.body.token;

        // First, use basic to login to get a token
        const bearerResponse = await mockRequest
          .get('/secret')
          .set('Authorization', `Bearer ${token}`);

        // Not checking the value of the response, only that we "got in"
        expect(bearerResponse.status).toBe(200);
        done();
      });

    });

    describe('bad logins', () => {
      it('basic fails with known user and wrong password ', async (done) => {

        const response = await mockRequest.post('/signin')
          .auth('admin', 'xyz');
        const userObject = response.body;

        expect(response.status).toBe(403);
        expect(userObject.user).not.toBeDefined();
        expect(userObject.token).not.toBeDefined();
        done();
      });

      it('basic fails with unknown user', async (done) => {

        const response = await mockRequest.post('/signin')
          .auth('nobody', 'xyz');
        const userObject = response.body;

        expect(response.status).toBe(403);
        expect(userObject.user).not.toBeDefined();
        expect(userObject.token).not.toBeDefined();
        done();
      });

      it('bearer fails with an invalid token', async (done) => {

        // First, use basic to login to get a token
        const bearerResponse = await mockRequest
          .get('/users')
          .set('Authorization', `Bearer foobar`);

        // Not checking the value of the response, only that we "got in"
        expect(bearerResponse.status).toBe(403);
        done();
      });
    });

  });
});

describe(`V1 Routes`, () => {

  Object.keys(v1models).forEach(model => {

    describe(`${model} model`, () => {

      it(`can create ${model}`, async (done) => {
        let response = await mockRequest.post(`/api/v1/${model}`).send(v1models[model]);

        expect(response.body.name).toBe(v1models[model].name);
        done();
      });

      it(`can get ${model}`, async (done) => {
        let response = await mockRequest.get(`/api/v1/${model}`);

        expect(response.body).toBeDefined();
        expect(response.body[0]).toHaveProperty(Object.keys(v1models[model])[0]);
        expect(response.body[0]).toHaveProperty(Object.keys(v1models[model])[1]);
        expect(response.body[0]).toHaveProperty(Object.keys(v1models[model])[2]);
        done();
      });

      it(`can get one of the rows from the ${model} table`, async (done) => {
        let response = await mockRequest.get(`/api/v1/${model}/1`);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty(Object.keys(v1models[model])[0]);
        expect(response.body).toHaveProperty(Object.keys(v1models[model])[1]);
        expect(response.body).toHaveProperty(Object.keys(v1models[model])[2]);
        done();
      });

      it(`can update one of the rows from the ${model} table`, async (done) => {
        let response = await mockRequest.put(`/api/v1/${model}/1`).send({ name: 'test2' });

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty(Object.keys(v1models[model])[0]);
        expect(response.body).toHaveProperty(Object.keys(v1models[model])[1]);
        expect(response.body).toHaveProperty(Object.keys(v1models[model])[2]);
        expect(response.body.name).toEqual('test2');
        done();
      });

      it(`can delete one of the rows from the ${model} table`, async (done) => {
        let response = await mockRequest.delete(`/api/v1/${model}/1`);

        expect(response.body).toBe(1);
        done();
      });
    });
  });
});

describe(`V2 Routes`, () => {

  Object.keys(users).forEach(userType => {

    let token = '';

    describe(`${userType} users`, () => {

      it('can signin with basic', async (done) => {

        const response = await mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password);

        const userObject = response.body;
        expect(response.status).toBe(200);
        expect(userObject.token).toBeDefined();
        expect(userObject.user.id).toBeDefined();
        expect(userObject.user.username).toEqual(users[userType].username);
        done();
      });

      it('can signin with bearer', async (done) => {

        // First, use basic to login to get a token
        const response = await mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password);

        token = response.body.token;

        // First, use basic to login to get a token
        const bearerResponse = await mockRequest
          .get('/secret')
          .set('Authorization', `Bearer ${token}`);

        // Not checking the value of the response, only that we "got in"
        expect(bearerResponse.status).toBe(200);
        done();
      });

      Object.keys(v2models).forEach(model => {

        describe(`${model} model`, () => {

          it(userType === 'user' ? `cannot create ${model}` : `can create ${model}`, async (done) => {
            let response = await mockRequest.post(`/api/v2/${model}`)
              .send(v2models[model])
              .set('Authorization', `Bearer ${token}`);

            if (userType === 'user') {
              expect(response.status).toBe(403);
              done();
            } else {
              expect(response.body.name).toBe(v2models[model].name);
              done();
            }
          });

          it(`can get ${model}`, async (done) => {
            let response = await mockRequest.get(`/api/v2/${model}`)
              .auth(users[userType].username, users[userType].password);

            expect(response.body).toBeDefined();
            expect(response.body[0]).toHaveProperty(Object.keys(v2models[model])[0]);
            expect(response.body[0]).toHaveProperty(Object.keys(v2models[model])[1]);
            expect(response.body[0]).toHaveProperty(Object.keys(v2models[model])[2]);
            done();
          });

          it(`can get one of the rows from the ${model} table`, async (done) => {
            let response = await mockRequest.get(`/api/v2/${model}/2`)
              .auth(users[userType].username, users[userType].password);

            expect(response.body).toBeDefined();
            expect(response.body).toHaveProperty(Object.keys(v2models[model])[0]);
            expect(response.body).toHaveProperty(Object.keys(v2models[model])[1]);
            expect(response.body).toHaveProperty(Object.keys(v2models[model])[2]);
            done();
          });

          it(userType === 'user' || userType === 'writer' ? `cannot update one of the rows from the ${model} table` : `can update one of the rows from the ${model} table`, async (done) => {
            let response = await mockRequest.put(`/api/v2/${model}/2`).send({ name: 'test3' })
              .set('Authorization', `Bearer ${token}`);

            if (userType === 'user' || userType === 'writer') {
              expect(response.status).toBe(403);
              done();
            } else {
              expect(response.body).toHaveProperty(Object.keys(v2models[model])[0]);
              expect(response.body).toHaveProperty(Object.keys(v2models[model])[1]);
              expect(response.body).toHaveProperty(Object.keys(v2models[model])[2]);
              expect(response.body.name).toEqual('test3');
              done();
            }
          });

          it(userType === 'admin' ? `can delete one of the rows from the ${model} table` : `cannot delete one of the rows from the ${model} table`, async (done) => {
            let response = await mockRequest.delete(`/api/v2/${model}/2`)
              .set('Authorization', `Bearer ${token}`);

            if (userType === 'admin') {
              expect(response.body).toBe(1);
              done();
            } else {
              expect(response.status).toBe(403);
              done();
            }
          });
        });
      });
    });
  });
});