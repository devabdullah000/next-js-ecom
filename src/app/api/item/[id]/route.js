import db from '@/../db/models';
import { v4 as uuidv4 } from 'uuid';

export async function PATCH(req, { params }) {
  const transaction = await db.sequelize.transaction();
  try {
    const productId = params.id;
    const body = await req.json();
    const { name, price, isAvailable, description, note, tag, images } = body;

    const product = await db.Product.findByPk(productId, { transaction });
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    // Update fields if provided
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (description !== undefined) product.description = description;
    if (note !== undefined) product.note = note;
    if (tag !== undefined) product.tag = tag;

    await product.save({ transaction });

    // Update images if array is provided
    if (Array.isArray(images)) {
      // Remove existing images
      await db.ProductImage.destroy({ where: { productId }, transaction });

      // Add new images
      const productImages = images.map(url => ({
        id: uuidv4(),
        productId,
        url,
      }));
      if (productImages.length > 0) {
        await db.ProductImage.bulkCreate(productImages, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated product with images
    const updatedProduct = await db.Product.findByPk(productId, {
      include: [{ model: db.ProductImage, as: 'images', attributes: ['id', 'url'] }],
    });

    return new Response(JSON.stringify({ message: 'Product updated', product: updatedProduct }), { status: 200 });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({ error: 'Failed to update product' }), { status: 500 });
  }
}
