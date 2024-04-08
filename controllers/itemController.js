const Item = require('./../models/item');

// const items = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/items.json`)
// );
// check if the req.body is empty middleware
// exports.checkBody = (req, res, next) => {
//   if (!req.body.title || !req.body.category) {
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'missing title or category details' });
//   }
//   next();
// };

exports.getAllItems = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime
    // results: items.length,
    // data: {
    //   items: items
    // }
  });
};

exports.getItemById = (req, res) => {
  // convert id to a number
  // const id = req.params.id * 1;
  // const item = items.find(x => x.id === id);

  res.status(200).json({
    status: 'success'
    // data: {
    //   item: item
    // }
  });
};

exports.createItem = (req, res) => {
  res.status(201).json({
    status: 'success'
  });
};

exports.updateItem = (req, res) => {
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
