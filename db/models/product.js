"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // ✅ corrected
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "products",
      timestamps: true,
    }
  );

  Product.associate = (models) => {
    Product.hasMany(models.ProductImage, {
      foreignKey: "productId",
      as: "images",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Product;
};
