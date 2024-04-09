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

exports.getAllItems = async (req, res) => {
  try {
    const allItems = await Item.find({});
    res.status(200).json({
      status: 'success',
      results: allItems,
      data: allItems
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: item
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { title, desc, img, category, size, price } = req.body;
    const item = new Item({
      title: title,
      img: img,
      desc: desc,
      category: category,
      size: size,
      price: price
    });
    const newItem = await item.save();
    res.status(201).json({
      status: 'success',
      data: {
        item: newItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        item: updatedItem
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
