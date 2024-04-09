const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Item = require('../models/item');
const api = supertest(app);

const initialItems = [
  {
    title: 'long coat',
    img: 'long-coat.webp',
    category: 'coats',
    price: 355,
    desc: 'long white coat',
    size: '10'
  },
  {
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

test('a valid item can be added', async () => {
  const newItem = {
    title: 'balloony skirt',
    img: 'pink-skirt.webp',
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

  const response = await api.get('/api/v1/items');

  const descrips = response.body.data.map(x => x.desc);

  assert(descrips.includes('quilted balloon shape skirt'));
});

after(async () => {
  await mongoose.connection.close();
});
