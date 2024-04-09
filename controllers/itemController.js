const Item = require('./../models/item');

exports.getAllItems = async (req, res) => {
  // make a shallow copy of the req.qery by destructuring
  const queryObj = { ...req.query };
  //TODO: add in exluded fields here for when we are filtering (95)
  try {
    const allItems = await Item.find(req.query);
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
    const {
      title,
      desc,
      img,
      category,
      size,
      price,
      onSale,
      secretItem
    } = req.body;
    const item = new Item({
      title: title,
      img: img,
      desc: desc,
      category: category,
      size: size,
      price: price,
      onSale: onSale,
      secretItem: secretItem
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
