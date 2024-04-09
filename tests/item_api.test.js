const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Item = require('../models/item');
const api = supertest(app);

const initialItems = [
  {
    id: 1,
    title: 'long coat',
    img: 'coat.webp',
    category: 'coats',
    price: 355,
    desc: 'long white coat',
    size: '10'
  },
  {
    id: 2,
    title: 'applique dress',
    img: 'applique-dress.webp',
    category: 'dresses',
    price: 455,
    desc: 'long white organza dress wit applique',
    size: '12'
  }
];

beforeEach(async () => {
  await Item.deleteMany({});
  let itemObject = new Item(initialItems[0]);
  await itemObject.save();
  itemObject = new Item(initialItems[1]);
  await itemObject.save();
});

test('items are returned as json', async () => {
  const response = await api
    .get('/api/v1/items')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  console.log('response is', response.body.data);
});

test('there are two items', async () => {
  const response = await api.get('/api/v1/items');

  assert.strictEqual(response.body.data.length, 2);
});

after(async () => {
  await mongoose.connection.close();
});
