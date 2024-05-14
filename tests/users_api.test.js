const supertest = require("supertest");
const mongoose = require("mongoose");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const helper = require("./test_helper");
const app = require("../app");

const api = supertest(app);
const Item = require("../models/item");
const User = require("../models/user");

describe("users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("a user with a unique username can register", async () => {
    const newUser = {
      username: "bunty",
      email: "bunt@me.com",
      password: "sekret",
      passwordConfirm: "sekret"
    };
    const usersAtStart = await helper.usersInDb();

    const res = await api
      .post("/api/v1/users/register")
      .send(newUser)
      .expect(201);
    assert.strictEqual(res.body.data.user.username, newUser.username);
    assert.strictEqual(res.body.data.user.email, newUser.email);

    const usersAtEnd = await helper.usersInDb();

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
  });

  test("a user with a duplicate username cannot register", async () => {
    const newUser = {
      username: "mintypeas",
      email: "mintypeas@me.com",
      password: "sekret",
      passwordConfirm: "sekret"
    };

    await api
      .post("/api/v1/users/register")
      .send(newUser)
      .expect(201);

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

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.msg.includes("Duplicate field value"));
    assert.strictEqual(usersAtEnd.length, 1);
  });

  describe("when a user is registered and there are some items in the database", () => {
    beforeEach(async () => {
      // clear the database and add the initial items and users
      await User.deleteMany({});
      await Item.deleteMany({});
      await Item.insertMany(helper.initialItems);
      // add patchy to users
      const patchy = {
        username: "patchy",
        email: "patchy@me.com",
        password: "sekret",
        passwordConfirm: "sekret"
      };
      //register
      await api
        .post("/api/v1/users/register")
        .send(patchy)
        .expect(201);
    });

    //TODO: image goes to test image folder - but need to clear this at the start of tests?
    test("they can create a new item", async () => {
      const patchyLoginDetails = {
        email: "patchy@me.com",
        password: "sekret",
        passwordConfirm: "sekret"
      };
      //login
      const logInResponse = await api
        .post("/api/v1/users/login")
        .send(patchyLoginDetails);
      const { token } = logInResponse.body;

      //create an item
      await api
        .post("/api/v1/items")
        .set("Content-type", "multipart/form-data")
        .field("title", "trousers")
        .field("category", "trousers")
        .field("price", 35)
        .field("desc", "trousers")
        .field("size", "10")
        .field("user", `${logInResponse.body.id}`)
        .attach("img", "tests/img/coat.webp")
        .set({ Authorization: `Bearer ${token}` })
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const itemsAtEnd = await helper.itemsInDb();
      const descrips = itemsAtEnd.map(item => item.desc);

      assert.strictEqual(itemsAtEnd.length, helper.initialItems.length + 1);
      assert(descrips.includes("trousers"));
    });

    test("a invalid item cannot be added", async () => {
      const patchyLoginDetails = {
        email: "patchy@me.com",
        password: "sekret"
      };
      //login
      const logInResponse = await api
        .post("/api/v1/users/login")
        .send(patchyLoginDetails);
      const { token } = logInResponse.body;
      const result = await api
        .post("/api/v1/items")
        .set("Content-type", "multipart/form-data")
        .field("title", "trousers")
        .field("category", "trousers")
        .field("price", 35)
        .field("desc", "")
        .field("size", "10")
        .attach("img", "tests/img/coat.webp")
        .set({ Authorization: `Bearer ${token}` })
        .expect(400)
        .expect("Content-Type", /application\/json/);
      const itemsAtEnd = await helper.itemsInDb();

      assert.strictEqual(itemsAtEnd.length, helper.initialItems.length);
      assert(result.body.msg.includes("Please describe the item"));
    });
  });

  // TODO: test for updating item if it belongs to the user
  // TODO: test for deleting item if it belongs to the user
  // TODO: the inverse of both of the above

  // describe("deletion of an item", () => {
  //   test("succeeds with status code 204 if id is valid", async () => {
  //     const itemsAtStart = await helper.itemsInDb();

  //     const itemToDelete = itemsAtStart[0];

  //     await api.delete(`/api/v1/items/${itemToDelete.id}`).expect(204);

  //     const itemsAtEnd = await helper.itemsInDb();

  //     const descrips = itemsAtEnd.map(x => x.desc);
  //     assert(!descrips.includes(itemToDelete.desc));
  //   });
  // });
  after(() => {
    mongoose.connection.close();
  });
});
