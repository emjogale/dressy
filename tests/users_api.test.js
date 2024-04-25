const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const Item = require('../models/item');
const User = require('../models/user');
const api = supertest(app);

describe('when there is initially one user in the db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const user = new User({
      username: 'minty',
      email: 'peas@me.com',
      password: 'sekret',
      passwordConfirm: 'sekret'
    });

    await user.save();
  });

  test('a user with a unique username can register', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'bunty',
      email: 'bunt@me.com',
      password: 'sekret',
      passwordConfirm: 'sekret'
    };

    await api
      .post('/api/v1/users/register')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
  });

  test('a user with a duplicate username cannot register', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'minty',
      email: 'minty@me.com',
      password: 'sekret',
      passwordConfirm: 'sekret'
    };

    const result = await api
      .post('/api/v1/users/register')
      .send(newUser)
      .expect(400);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.msg.includes('Duplicate field value'));
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
