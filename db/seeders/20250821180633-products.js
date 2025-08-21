"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    const productId = uuidv4();

    // Insert one product
    await queryInterface.bulkInsert("products", [
      {
        id: productId,
        name: "Sample Product",
        price: 49.99,
        isAvailable: true,
        description: "A demo product for testing eager loading.",
        note: "This is just a sample note.",
        tag: "demo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Insert related images
    await queryInterface.bulkInsert("productImages", [
      {
        id: uuidv4(),
        productId: productId,
        url: "https://via.placeholder.com/300x300.png?text=Image+1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        productId: productId,
        url: "https://via.placeholder.com/300x300.png?text=Image+2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    // Delete all inserted productImages first (foreign key constraint)
    await queryInterface.bulkDelete("productImages", null, {});
    await queryInterface.bulkDelete("products", null, {});
  },
};
