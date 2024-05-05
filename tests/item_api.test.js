const supertest = require("supertest");
const mongoose = require("mongoose");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const app = require("../app");

const api = supertest(app);
const helper = require("./test_helper");

const Item = require("../models/item");
const User = require("../models/user");

const testUser = {
  username: "testuser",
  email: "testuser@me.com",
  password: "sekret"
};

// eslint-disable-next-line no-unused-vars
let token;

describe("when there are initially some items saved", () => {
  beforeEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    const itemObjects = helper.initialItems.map(item => new Item(item));
    // console.log("itemObjects are", itemObjects);
    const promiseArray = itemObjects.map(item => item.save());

    await Promise.all(promiseArray);

    await api.post("/api/v1/users/register").send(testUser);

    const response = await api.post("/api/v1/login").send(testUser);

    // eslint-disable-next-line prefer-destructuring
    token = response.body.token;
  });
  test("items are returned as json", async () => {
    const res = await api
      .get("/api/v1/items")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    console.log("res.body is", res.body);
    assert.strictEqual(res.body.length, helper.initialItems.length);
  });

  test("there are two items", async () => {
    const response = await api.get("/api/v1/items");

    assert.strictEqual(response.body.data.length, 2);
  });

  test("the first item is a long coat", async () => {
    const response = await api.get("/api/v1/items");

    const titles = response.body.data.map(x => x.title);
    assert(titles.includes("long coat"));
  });

  // Also - how do you mimic userid in the tests??
  // describe("addition of a new item", () => {
  //   test("succeeds with valid data", async () => {
  //     await api
  //       .post("/api/v1/items")
  //       .set("Content-type", "multipart/form-data")
  //       .field("title", "trousers")
  //       .field("category", "trousers")
  //       .field("price", 35)
  //       .field("desc", "trousers")
  //       .field("size", "10")
  //       .attach("img", "tests/img/coat.webp")
  //       .expect(201)
  //       .expect("Content-Type", /application\/json/);

  //     const itemsAtEnd = await helper.itemsInDb();
  //     assert.strictEqual(itemsAtEnd.length, helper.initialItems.length + 1);

  //     const descrips = itemsAtEnd.map(item => item.desc);
  //     assert(descrips.includes("trousers"));
  //   });

  // });
  describe("viewing a specific item", () => {
    test("suceeds with a valid id", async () => {
      const itemsAtStart = await helper.itemsInDb();

      const itemToView = itemsAtStart[0];

      const foundItem = await api
        .get(`/api/v1/items/${itemToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.notStrictEqual(foundItem.body.data, itemToView);
    });

    test("fails with status code 400 if id is invalid", async () => {
      const invalidId = "66150ea920b0fb";

      await api.get(`/api/v1/items/${invalidId}`).expect(400);
    });
  });

  // need to refactor this one with log in logic
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
