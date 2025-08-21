"use strict";

module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    "ProductImage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // ✅ corrected
        primaryKey: true,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "productImages",
      timestamps: true,
    }
  );

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return ProductImage;
};
