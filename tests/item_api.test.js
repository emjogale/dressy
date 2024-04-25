const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const Item = require('../models/item');
const api = supertest(app);

beforeEach(async () => {
  await Item.deleteMany({});
  await Item.insertMany(helper.initialItems);
});
describe('when there are initially some items saved', () => {
  test('items are returned as json', async () => {
    const response = await api
      .get('/api/v1/items')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are two items', async () => {
    const response = await api.get('/api/v1/items');

    assert.strictEqual(response.body.data.length, 2);
  });

  test('the first item is a long coat', async () => {
    const response = await api.get('/api/v1/items');

    const titles = response.body.data.map(x => x.title);
    assert(titles.includes('long coat'));
  });
});

//TODO: how to change tests to allow for multer upload
describe('addition of a new item', () => {
  test('succeeds with valid data', async () => {
    const newItem = {
      title: 'ballooning skirt',
      img: '/assets/img/pink-skirt.webp',
      desc: 'quilted balloon shape skirt',
      category: 'dresses',
      size: '10',
      price: 255
    };

    await api
      .post('/api/v1/items')
      .send(newItem)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const itemsAtEnd = await helper.itemsInDb();
    assert.strictEqual(itemsAtEnd.length, helper.initialItems.length + 1);

//     const descrips = itemsAtEnd.map(x => x.desc);
//     assert(descrips.includes('quilted balloon shape skirt'));
//   });

//   test("a invalid item can't be added", async () => {
//     const newItem = {
//       title: '',
//       img: 'pink-skirt.webp',
//       desc: 'quilted balloon shape skirt',
//       category: 'dresses',
//       size: '10',
//       price: 255
//     };

//     await api
//       .post('/api/v1/items')
//       .send(newItem)
//       .expect(500);

//     const itemsAtEnd = await helper.itemsInDb();

//     assert.strictEqual(itemsAtEnd.length, helper.initialItems.length);
//   });
//});
describe('viewing a speicic item', () => {
  test('suceeds with a valid id', async () => {
    const itemsAtStart = await helper.itemsInDb();

    const itemToView = itemsAtStart[0];

    const foundItem = await api
      .get(`/api/v1/items/${itemToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.notStrictEqual(foundItem.body.data, itemToView);
  });

  //TODO: refactor to expect 400 when have worked through error handling
  test('fails with status code 404 id is invalid', async () => {
    const invalidId = '66150ea920b0fb519287d198';

    await api.get(`/api/v1/items/${invalidId}`).expect(404);
  });
});

describe('deletion of an item', () => {
  test('succeeds with status code 204 if id is valid', async () => {
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
