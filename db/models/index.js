'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

// Reuse existing instance if available (important for Next.js hot reloads)
let sequelize;

if (!globalThis._sequelize) {
  globalThis._sequelize = new Sequelize({
    dialect: config.dialect,   // "sqlite"
    storage: config.storage,   // e.g. "db/dev.sqlite"
    logging: false,
    dialectModule: require('sqlite3'),
  });
}

sequelize = globalThis._sequelize;

// Models
const db = {};
db.User = require('./users')(sequelize, Sequelize.DataTypes);
db.Cart= require('./cart')(sequelize, Sequelize.DataTypes);
db.CartItem= require('./cartItems')(sequelize, Sequelize.DataTypes);
db.Order= require('./orders')(sequelize, Sequelize.DataTypes);
db.OrderItem= require('./orderItems')(sequelize, Sequelize.DataTypes);
db.Product = require('./product')(sequelize, Sequelize.DataTypes);
db.ProductImage = require('./productImages')(sequelize, Sequelize.DataTypes);

// Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
