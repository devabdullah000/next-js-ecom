import db from '@/../db/models';
import { validate as isUUID } from 'uuid';

export async function GET(_req, { params }) {
  try {
    const userId = params.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400 }
      );
    }

    const cart = await db.Cart.findOne({
      where: { userId },
      include: [
        {
          model: db.CartItem,
          as: 'items',
          attributes: ['id', 'cartId', 'productId', 'qty', 'createdAt', 'updatedAt'],
          include: [
            {
              model: db.Product,
              as: 'product',
              attributes: { exclude: ['description', 'note'] },
              include: [
                {
                  model: db.ProductImage,
                  as: 'images',
                  attributes: ['id', 'url'],
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: db.CartItem, as: 'items' }, 'createdAt', 'DESC']],
    });

    if (!cart) {
      return new Response(
        JSON.stringify({ error: 'Cart not found' }),
        { status: 404 }
      );
    }

    // Convert Sequelize objects to plain JS and fix UUIDs
    const cartItems = cart.items.map(item => ({
      id: Buffer.isBuffer(item.id) ? item.id.toString('hex') : String(item.id),
      cartId: Buffer.isBuffer(item.cartId) ? item.cartId.toString('hex') : String(item.cartId),
      productId: Buffer.isBuffer(item.productId) ? item.productId.toString('hex') : String(item.productId),
      qty: item.qty,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        ...item.product.get({ plain: true }),
        images: item.product.images.map(img => ({
          id: Buffer.isBuffer(img.id) ? img.id.toString('hex') : String(img.id),
          url: img.url,
        })),
      },
    }));

    return new Response(JSON.stringify(cartItems, null, 2), { status: 200 });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch cart' }),
      { status: 500 }
    );
  }
}

// Update product quantity in cart
export async function PATCH(req, { params }) {
  try {
    const productId = params.id; // productId from URL
    if (!isUUID(productId)) {
      return new Response(JSON.stringify({ error: 'Invalid productId' }), { status: 400 });
    }

    const body = await req.json();
    const { userId, qty } = body;

    if (!userId || typeof qty !== 'number' || qty < 1) {
      return new Response(JSON.stringify({ error: 'userId and valid qty are required' }), { status: 400 });
    }

    const cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) {
      return new Response(JSON.stringify({ error: 'Cart not found' }), { status: 404 });
    }

    const item = await db.CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!item) {
      return new Response(JSON.stringify({ error: 'Product not in cart' }), { status: 404 });
    }

    item.qty = qty;
    await item.save();

    return new Response(JSON.stringify({ message: 'Quantity updated' }), { status: 200 });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return new Response(JSON.stringify({ error: 'Failed to update cart item' }), { status: 500 });
  }
}

// Remove product from cart
export async function DELETE(_req, { params }) {
  try {
    const productId = params.id; // productId from URL
    if (!isUUID(productId)) {
      return new Response(JSON.stringify({ error: 'Invalid productId' }), { status: 400 });
    }

    const searchParams = new URL(_req.url).searchParams;
    const userId = searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
    }

    const cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) {
      return new Response(JSON.stringify({ error: 'Cart not found' }), { status: 404 });
    }

    const deleted = await db.CartItem.destroy({ where: { cartId: cart.id, productId } });
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Product not in cart' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Product removed from cart' }), { status: 200 });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    return new Response(JSON.stringify({ error: 'Failed to remove product from cart' }), { status: 500 });
  }
}
