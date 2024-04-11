const express = require('express');
const viewsController = require('./../controllers/viewsController');

const router = express.Router();

// we only use GET in the view routes
router.get('/', viewsController.getHomeView);
router.get('/item/:slug', viewsController.getItem);
router.get('/sell', viewsController.getSellForm);
router.get('/about', (req, res) => {
  res.status(200).render('about');
});

module.exports = router;
