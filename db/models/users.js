"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

module.exports = (sequelize,DataTypes) => {
  const Admin = sequelize.define(
    "Admin",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("admin"),
        allowNull: false,
      },
    },
    {
      tableName: "admin",
      timestamps: true,
      hooks: {
        beforeCreate: async (admin) => {
          if (admin.password) {
            admin.password = await bcrypt.hash(admin.password, 10);
          }
        },
        beforeUpdate: async (admin) => {
          if (admin.password && admin.changed("password")) {
            admin.password = await bcrypt.hash(admin.password, 10);
          }
        },
      },
    }
  );

  return Admin;
};
