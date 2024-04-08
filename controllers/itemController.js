const fs = require('fs');

const items = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/items.json`)
);

// param middleware
exports.checkId = (req, res, next, val) => {
  if (val * 1 > items.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  }
  next();
};

// check if the req.body is empty middleware
exports.checkBody = (req, res, next) => {
  if (!req.body.title || !req.body.category) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'missing title or category details' });
  }
  next();
};

exports.getAllItems = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: items.length,
    data: {
      items: items
    }
  });
};

exports.getItemById = (req, res) => {
  // convert id to a number
  const id = req.params.id * 1;
  const item = items.find(x => x.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      item: item
    }
  });
};

exports.createItem = (req, res) => {
  //   console.log('the body is', req.body);
  const newId = items[items.length - 1].id + 1;
  const newItem = Object.assign({ id: newId }, req.body);

  items.push(newItem);
  fs.writeFile(
    `${__dirname}/dev-data/data/items.json`,
    JSON.stringify(items),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newItem
        }
      });
    }
  );
};

exports.updateItem = (req, res) => {
  // convert id to a number

  const item = items.find(x => x.id === item.id);

  res.status(204).json({
    status: 'success',
    data: {
      item: 'Updated item here'
    }
  });
};

exports.deleteItem = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
