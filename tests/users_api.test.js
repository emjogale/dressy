const supertest = require("supertest");
const mongoose = require("mongoose");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const { initialUsers, usersInDb } = require("./test_helper");
const app = require("../app");

const api = supertest(app);
const Item = require("../models/item");
const User = require("../models/user");

// eslint-disable-next-line no-unused-vars
let token;

describe("users", () => {
  beforeEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});

    // create a test user and save the corresponding token and id
    const testUser = initialUsers[0];
    await api.post("/api/v1/users/register").send(testUser);
    const res = await api.post("/api/v1/users/login").send(testUser);
    // eslint-disable-next-line prefer-destructuring
    token = res.body.token;
  });

  test("a user with a unique username can register", async () => {
    const newUser = {
      username: "bunty",
      email: "bunt@me.com",
      password: "sekret",
      passwordConfirm: "sekret"
    };
    const usersAtStart = await usersInDb();

    const res = await api
      .post("/api/v1/users/register")
      .send(newUser)
      .expect(201);
    assert.strictEqual(res.body.data.user.username, newUser.username);
    assert.strictEqual(res.body.data.user.email, newUser.email);

    const usersAtEnd = await usersInDb();

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
  });

  test("a user with a duplicate username cannot register", async () => {
    const duplicateUser = {
      username: "mintypeas",
      email: "peas@me.com",
      password: "sekret",
      passwordConfirm: "sekret"
    };
    const result = await api
      .post("/api/v1/users/register")
      .send(duplicateUser)
      .expect(400);

    const usersAtEnd = await usersInDb();

    assert(result.body.msg.includes("Duplicate field value"));
    assert.strictEqual(usersAtEnd.length, 1);
  });

  after(() => {
    mongoose.connection.close();
  });
});
