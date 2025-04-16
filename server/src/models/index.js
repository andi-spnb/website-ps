const sequelize = require('../config/database');
const Device = require('./Device');
const Pricing = require('./Pricing');
const User = require('./User');
const Staff = require('./Staff');
const RentalSession = require('./RentalSession');
const FoodItem = require('./FoodItem');
const FoodOrder = require('./FoodOrder');
const OrderItem = require('./OrderItem');
const Shift = require('./Shift');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const CustomerIdentity = require('./CustomerIdentity');


// Playbox models
const Playbox = require('./Playbox');
const PlayboxReservation = require('./PlayboxReservation');
const PlayboxGame = require('./PlayboxGame');
const PlayboxPricing = require('./PlayboxPricing');

// Definisikan relasi antar model
Device.hasMany(RentalSession, { foreignKey: 'device_id' });
RentalSession.belongsTo(Device, { foreignKey: 'device_id' });

User.hasMany(RentalSession, { foreignKey: 'user_id' });
RentalSession.belongsTo(User, { foreignKey: 'user_id' });

Staff.hasMany(RentalSession, { foreignKey: 'staff_id' });
RentalSession.belongsTo(Staff, { foreignKey: 'staff_id' });

Staff.hasMany(FoodOrder, { foreignKey: 'staff_id' });
FoodOrder.belongsTo(Staff, { foreignKey: 'staff_id' });

RentalSession.hasMany(FoodOrder, { foreignKey: 'session_id' });
FoodOrder.belongsTo(RentalSession, { foreignKey: 'session_id' });

FoodOrder.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(FoodOrder, { foreignKey: 'order_id' });

FoodItem.hasMany(OrderItem, { foreignKey: 'item_id' });
OrderItem.belongsTo(FoodItem, { foreignKey: 'item_id' });

Staff.hasMany(Shift, { foreignKey: 'staff_id' });
Shift.belongsTo(Staff, { foreignKey: 'staff_id' });

Shift.hasMany(Transaction, { foreignKey: 'shift_id' });
Transaction.belongsTo(Shift, { foreignKey: 'shift_id' });

// Relasi Playbox
Playbox.hasMany(PlayboxReservation, { foreignKey: 'playbox_id' });
PlayboxReservation.belongsTo(Playbox, { foreignKey: 'playbox_id' });

Playbox.hasMany(PlayboxGame, { foreignKey: 'playbox_id' });
PlayboxGame.belongsTo(Playbox, { foreignKey: 'playbox_id' });

Staff.hasMany(PlayboxReservation, { foreignKey: 'staff_id' });
PlayboxReservation.belongsTo(Staff, { foreignKey: 'staff_id' });

PlayboxReservation.belongsTo(Playbox, { foreignKey: 'playbox_id' });
Playbox.hasMany(PlayboxReservation, { foreignKey: 'playbox_id' });

PlayboxReservation.hasOne(CustomerIdentity, { foreignKey: 'reservation_id' });
CustomerIdentity.belongsTo(PlayboxReservation, { foreignKey: 'reservation_id' });



Transaction.belongsTo(RentalSession, { 
  foreignKey: 'reference_id', 
  constraints: false,
  as: 'RentalReference'
});

module.exports = {
  sequelize,
  Device,
  Pricing,
  User,
  Staff,
  RentalSession,
  FoodItem,
  FoodOrder,
  OrderItem,
  Shift,
  Transaction,
  Notification,
  Playbox,
  PlayboxReservation,
  PlayboxGame,
  PlayboxPricing,
  CustomerIdentity
};