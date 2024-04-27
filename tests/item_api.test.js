const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const app = require("../app");
const Item = require("../models/item");

const api = supertest(app);

beforeEach(async () => {
  await Item.deleteMany({});
  await Item.insertMany(helper.initialItems);
});
describe("when there are initially some items saved", () => {
  test("items are returned as json", async () => {
    await api
      .get("/api/v1/items")
      .expect(200)
      .expect("Content-Type", /application\/json/);
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
});

//TODO: need to refactor this as at present the test adds the helper image to the main img file. Is there another way to send it to a separate test img file? This would be via the multer destination...

// Also - how do you mimic userid in the tests??
describe("addition of a new item", () => {
  test("succeeds with valid data", async () => {
    await api
      .post("/api/v1/items")
      .set("Content-type", "multipart/form-data")
      .field("title", "trousers")
      .field("category", "trousers")
      .field("price", 35)
      .field("desc", "trousers")
      .field("size", "10")
      .attach("img", "tests/img/coat.webp")
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const itemsAtEnd = await helper.itemsInDb();
    assert.strictEqual(itemsAtEnd.length, helper.initialItems.length + 1);

    const descrips = itemsAtEnd.map(item => item.desc);
    assert(descrips.includes("trousers"));
  });

  test("a invalid item cannot be added", async () => {
    const newItem = {
      title: "",
      desc: "quilted balloon shape skirt",
      category: "dresses",
      size: "10",
      price: 255
    };

    await api
      .post("/api/v1/items")
      .send(newItem)
      .expect(500);

    const itemsAtEnd = await helper.itemsInDb();

    assert.strictEqual(itemsAtEnd.length, helper.initialItems.length);
  });
});
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

describe("deletion of an item", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const itemsAtStart = await helper.itemsInDb();

    const itemToDelete = itemsAtStart[0];

    await api.delete(`/api/v1/items/${itemToDelete.id}`).expect(204);

    const itemsAtEnd = await helper.itemsInDb();

    const descrips = itemsAtEnd.map(x => x.desc);
    assert(!descrips.includes(itemToDelete.desc));
  });
});
after(async () => {
  await mongoose.connection.close();
});
