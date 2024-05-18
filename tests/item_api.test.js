const supertest = require("supertest");
const mongoose = require("mongoose");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const app = require("../app");

const api = supertest(app);
const { initialItems, initialUsers, itemsInDb } = require("./test_helper");
const Item = require("../models/item");
const User = require("../models/user");

let token;
let user;

describe("item api", () => {
  beforeEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});

    // save all the initial items to the database
    const itemObjects = initialItems.map(item => new Item(item));
    const promiseArray = itemObjects.map(item => item.save());
    await Promise.all(promiseArray);

    // create a test user and save the corresponding token and id
    const testUser = initialUsers[0];

    await api.post("/api/v1/users/register").send(testUser);
    const res = await api.post("/api/v1/users/login").send(testUser);
    // eslint-disable-next-line prefer-destructuring
    token = res.body.token;
    // eslint-disable-next-line prefer-destructuring
    user = res.body.id;
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

  describe("when a user is registered", () => {
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
        .field("user", `${user}`)
        .attach("img", "tests/img/coat.webp")
        .set({ Authorization: `Bearer ${token}` })
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const itemsAtEnd = await itemsInDb();
      const descrips = itemsAtEnd.map(item => item.desc);

      assert.strictEqual(itemsAtEnd.length, initialItems.length + 1);
      assert(descrips.includes("trousers"));
    });

    test("an invalid item cannot be added", async () => {
      const result = await api
        .post("/api/v1/items")
        .set("Content-type", "multipart/form-data")
        .field("title", "trousers")
        .field("category", "trousers")
        .field("price", 35)
        .field("desc", "")
        .field("size", "10")
        .field("user", `${user}`)
        .attach("img", "tests/img/coat.webp")
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);

      const itemsAtEnd = await itemsInDb();

      assert.strictEqual(itemsAtEnd.length, initialItems.length);
      assert(result.body.msg.includes("Please describe the item"));
    });

    describe("deletion of an item", () => {
      test("succeeds with status code 204 by the user who created the item", async () => {
        const res = await api
          .post("/api/v1/items")
          .set("Content-type", "multipart/form-data")
          .field("title", "trousers")
          .field("category", "trousers")
          .field("price", 35)
          .field("desc", "trousers")
          .field("size", "10")
          .field("user", `${user}`)
          .attach("img", "tests/img/coat.webp")
          .set({ Authorization: `Bearer ${token}` });

        const { id } = res.body.data.item;

        await api
          .delete(`/api/v1/items/${id}`)
          .set({ Authorization: `Bearer ${token}` })
          .expect(204);

        const itemsAtEnd = await itemsInDb();

        assert.strictEqual(itemsAtEnd.length, initialItems.length);
      });
    });
  });

  after(() => {
    mongoose.connection.close();
  });
});
