"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs"); // to hash password

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash("Sheharyar@1199", 10); // replace with desired password

    await queryInterface.bulkInsert(
      "admin",
      [
        {
          id: uuidv4(),
          name: "Super Admin",
          email: "sheharyar@gmail.com",
          password: passwordHash,
          phone: "1234567890",
          photoUrl: null,
          role: "admin",
          createdAt: Sequelize.literal("CURRENT_TIMESTAMP"),
          updatedAt: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("admin", { email: "admin@example.com" }, {});
  },
};
