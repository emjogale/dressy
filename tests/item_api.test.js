const supertest = require("supertest");
const mongoose = require("mongoose");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const app = require("../app");

const api = supertest(app);
const { initialItems, initialUsers, itemsInDb } = require("./test_helper");

const Item = require("../models/item");
const User = require("../models/user");

// eslint-disable-next-line no-unused-vars
let token;

describe("item api", () => {
  beforeEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});

    // create a test user and save the corresponding token
    const testUser = initialUsers[0];
    await api.post("/api/v1/users/register").send(testUser);
    const res = await api.post("/api/v1/login").send(testUser);
    // eslint-disable-next-line prefer-destructuring
    token = res.body.token;

    // save all the initial items to the database
    const itemObjects = initialItems.map(item => new Item(item));
    const promiseArray = itemObjects.map(item => item.save());
    await Promise.all(promiseArray);
  });
  test("items are returned as json", async () => {
    const res = await api
      .get("/api/v1/items")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(res.body.data.length, initialItems.length);
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

  describe("viewing a specific item", () => {
    test("suceeds with a valid id", async () => {
      const itemsAtStart = await itemsInDb();

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

  after(() => {
    mongoose.connection.close();
  });
});
