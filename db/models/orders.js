"use strict";

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "processing",
          "cancelled",
          "delivered",
          "refunded"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      refundReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
    }
  );

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: "orderId", as: "items" });
  };

  return Order;
};
