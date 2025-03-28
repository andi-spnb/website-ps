const { 
  FoodItem, 
  FoodOrder, 
  OrderItem, 
  Transaction, 
  Notification,
  RentalSession,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');

// Get all food items
exports.getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.findAll({
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    res.json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get food item by ID
exports.getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findByPk(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    
    res.json(foodItem);
  } catch (error) {
    console.error('Error fetching food item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new food item
exports.createFoodItem = async (req, res) => {
  try {
    const { name, category, price, stock_quantity, image_url, is_available } = req.body;
    
    const newFoodItem = await FoodItem.create({
      name,
      category,
      price,
      stock_quantity,
      image_url,
      is_available: is_available !== undefined ? is_available : true
    });
    
    res.status(201).json(newFoodItem);
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a food item
exports.updateFoodItem = async (req, res) => {
  try {
    const { name, category, price, stock_quantity, image_url, is_available } = req.body;
    const foodItem = await FoodItem.findByPk(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    
    await foodItem.update({
      name,
      category,
      price,
      stock_quantity,
      image_url,
      is_available
    });
    
    res.json(foodItem);
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a food item
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findByPk(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    
    // Check if item is used in any active orders
    const activeOrderItem = await OrderItem.findOne({
      include: [{
        model: FoodOrder,
        where: {
          status: {
            [Op.ne]: 'Cancelled'
          }
        }
      }],
      where: {
        item_id: req.params.id
      }
    });
    
    if (activeOrderItem) {
      return res.status(400).json({ message: 'Tidak dapat menghapus item yang digunakan dalam pesanan' });
    }
    
    await foodItem.destroy();
    
    res.json({ message: 'Item berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new food order
exports.createFoodOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { session_id, items, payment_method } = req.body;
    const staff_id = req.userData.staff_id;
    
    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Daftar item tidak valid' });
    }
    
    // Verify session exists if provided
    if (session_id) {
      const session = await RentalSession.findByPk(session_id, { transaction });
      if (!session) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Sesi rental tidak ditemukan' });
      }
    }
    
    // Verify all items exist and have sufficient stock
    const itemIds = items.map(item => item.item_id);
    const foodItems = await FoodItem.findAll({
      where: {
        item_id: {
          [Op.in]: itemIds
        }
      },
      transaction
    });
    
    if (foodItems.length !== itemIds.length) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Beberapa item tidak ditemukan' });
    }
    
    // Check stock quantities
    for (const item of items) {
      const foodItem = foodItems.find(fi => fi.item_id === item.item_id);
      if (foodItem.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Stok tidak cukup untuk ${foodItem.name}`,
          item: foodItem.name,
          available: foodItem.stock_quantity,
          requested: item.quantity
        });
      }
    }
    
    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
      const foodItem = foodItems.find(fi => fi.item_id === item.item_id);
      total_amount += foodItem.price * item.quantity;
    }
    
    // Create order
    const newOrder = await FoodOrder.create({
      session_id: session_id || null,
      staff_id,
      order_time: new Date(),
      total_amount,
      status: 'Preparing'
    }, { transaction });
    
    // Create order items and update stock
    const orderItems = [];
    for (const item of items) {
      const foodItem = foodItems.find(fi => fi.item_id === item.item_id);
      
      const newOrderItem = await OrderItem.create({
        order_id: newOrder.order_id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: foodItem.price,
        subtotal: foodItem.price * item.quantity
      }, { transaction });
      
      orderItems.push(newOrderItem);
      
      // Update stock quantity
      await foodItem.update({
        stock_quantity: foodItem.stock_quantity - item.quantity
      }, { transaction });
    }
    
    // Record transaction if not associated with a rental session
    if (!session_id) {
      await Transaction.create({
        shift_id: req.body.shift_id, // Current active shift
        type: 'Food',
        reference_id: newOrder.order_id,
        amount: total_amount,
        payment_method,
        transaction_time: new Date()
      }, { transaction });
    }
    
    // Create notification for food order
    await Notification.create({
      target_id: newOrder.order_id,
      type: 'OrderReady',
      message: `Pesanan makanan baru #${newOrder.order_id}`,
      created_at: new Date(),
      is_read: false
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Pesanan berhasil dibuat',
      order: {
        ...newOrder.toJSON(),
        items: orderItems.map(item => item.toJSON())
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating food order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await FoodOrder.findByPk(req.params.id, {
      include: [{ model: OrderItem }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    
    // If cancelling, return items to stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await sequelize.transaction(async (transaction) => {
        for (const item of order.OrderItems) {
          const foodItem = await FoodItem.findByPk(item.item_id, { transaction });
          await foodItem.update({
            stock_quantity: foodItem.stock_quantity + item.quantity
          }, { transaction });
        }
        
        await order.update({ status }, { transaction });
      });
    } else {
      await order.update({ status });
    }
    
    res.json({
      message: 'Status pesanan berhasil diperbarui',
      order: order.toJSON()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active food orders
exports.getActiveOrders = async (req, res) => {
  try {
    const activeOrders = await FoodOrder.findAll({
      where: {
        status: {
          [Op.ne]: 'Cancelled'
        }
      },
      include: [{
        model: OrderItem,
        include: [{ model: FoodItem }]
      }],
      order: [['order_time', 'DESC']]
    });
    
    res.json(activeOrders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get food order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await FoodOrder.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [{ model: FoodItem }]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders by session ID
exports.getOrdersBySession = async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const orders = await FoodOrder.findAll({
      where: {
        session_id
      },
      include: [{
        model: OrderItem,
        include: [{ model: FoodItem }]
      }],
      order: [['order_time', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching session orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update stock quantity
exports.updateStock = async (req, res) => {
  try {
    const { stock_quantity } = req.body;
    const foodItem = await FoodItem.findByPk(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    
    await foodItem.update({ stock_quantity });
    
    // Check if stock is low and create notification
    if (stock_quantity <= 5 && foodItem.is_available) {
      await Notification.create({
        target_id: foodItem.item_id,
        type: 'StockLow',
        message: `Stok ${foodItem.name} tinggal ${stock_quantity}`,
        created_at: new Date(),
        is_read: false
      });
    }
    
    res.json({
      message: 'Stok berhasil diperbarui',
      item: foodItem.toJSON()
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};