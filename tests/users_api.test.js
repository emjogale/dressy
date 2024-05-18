const supertest = require("supertest");
const mongoose = require("mongoose");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const {
  initialItems,
  initialUsers,
  usersInDb,
  itemsInDb
} = require("./test_helper");
const app = require("../app");

const api = supertest(app);
const Item = require("../models/item");
const User = require("../models/user");

// eslint-disable-next-line no-unused-vars
let token;
let id;
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
    // eslint-disable-next-line prefer-destructuring
    id = res.body.id;

    // save all the initial items to the database
    const itemObjects = initialItems.map(item => new Item(item));
    const promiseArray = itemObjects.map(item => item.save());
    await Promise.all(promiseArray);
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

  describe("when a user is registered and there are some items in the database", () => {
    //TODO: image goes to test image folder - but need to clear this at the start of tests?
    test("they can create a new item", async () => {
      await api
        .post("/api/v1/items")
        .set("Content-type", "multipart/form-data")
        .field("title", "trousers")
        .field("category", "trousers")
        .field("price", 35)
        .field("desc", "trousers")
        .field("size", "10")
        .field("user", `${id}`)
        .attach("img", "tests/img/coat.webp")
        .set({ Authorization: `Bearer ${token}` })
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const itemsAtEnd = await itemsInDb();
      const descrips = itemsAtEnd.map(item => item.desc);

      assert.strictEqual(itemsAtEnd.length, initialItems.length + 1);
      assert(descrips.includes("trousers"));
    });

    test("a invalid item cannot be added", async () => {
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
      const itemsAtEnd = await itemsInDb();

      assert.strictEqual(itemsAtEnd.length, initialItems.length);
      assert(result.body.msg.includes("Please describe the item"));
    });
  });

  // TODO: test for updating item if it belongs to the user
  // TODO: test for deleting item if it belongs to the user
  // TODO: the inverse of both of the above

  // describe("deletion of an item", () => {
  //   test("succeeds with status code 204 if id is valid", async () => {
  //     const itemsAtStart = await itemsInDb();

  //     const itemToDelete = itemsAtStart[0];

  //     await api.delete(`/api/v1/items/${itemToDelete.id}`).expect(204);

  //     const itemsAtEnd = await itemsInDb();

  //     const descrips = itemsAtEnd.map(x => x.desc);
  //     assert(!descrips.includes(itemToDelete.desc));
  //   });
  // });
  after(() => {
    mongoose.connection.close();
  });
});
