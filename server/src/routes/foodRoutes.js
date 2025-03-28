const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Items routes
router.get('/items', auth, foodController.getAllFoodItems);
router.get('/items/:id', auth, foodController.getFoodItemById);
router.post('/items', auth, roleCheck(['Admin', 'Owner']), foodController.createFoodItem);
router.put('/items/:id', auth, roleCheck(['Admin', 'Owner']), foodController.updateFoodItem);
router.delete('/items/:id', auth, roleCheck(['Admin', 'Owner']), foodController.deleteFoodItem);
router.patch('/items/:id/stock', auth, foodController.updateStock);

// Orders routes
router.get('/orders/active', auth, foodController.getActiveOrders);
router.get('/orders/:id', auth, foodController.getOrderById);
router.get('/session/:session_id/orders', auth, foodController.getOrdersBySession);
router.post('/orders', auth, foodController.createFoodOrder);
router.patch('/orders/:id/status', auth, foodController.updateOrderStatus);

module.exports = router;