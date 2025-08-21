"use strict";

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "carts",
      timestamps: true,
    }
  );

  Cart.associate = (models) => {
    Cart.hasMany(models.CartItem, { foreignKey: "cartId", as: "items" });
  };

  return Cart;
};
