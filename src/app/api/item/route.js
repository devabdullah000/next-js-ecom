import db from '@/../db/models';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const transaction = await db.sequelize.transaction();
  try {
    const body = await req.json();
    const { name, price, isAvailable = true, description, note, tag, images = [] } = body;

    if (!name || typeof price !== 'number') {
      return new Response(JSON.stringify({ error: 'name and price are required' }), { status: 400 });
    }

    // Generate UUID for product
    const productId = uuidv4();

    // Create product
    const product = await db.Product.create(
      { id: productId, name, price, isAvailable, description, note, tag },
      { transaction }
    );

    // Create product images
    const productImages = images.map(url => ({
      id: uuidv4(),
      productId: product.id,
      url,
    }));

    if (productImages.length > 0) {
      await db.ProductImage.bulkCreate(productImages, { transaction });
    }

    await transaction.commit();

    // Fetch the created product with images
    const createdProduct = await db.Product.findByPk(product.id, {
      include: [{ model: db.ProductImage, as: 'images', attributes: ['id', 'url'] }],
    });

    return new Response(JSON.stringify({ message: 'Product created', product: createdProduct }), { status: 201 });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
  }
}
