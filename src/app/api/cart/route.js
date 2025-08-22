import db from '@/../db/models';
import { validate as isUUID } from 'uuid';

// Add to Cart
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, productId, qty = 1 } = body;

    if (!userId || !productId) {
      return new Response(
        JSON.stringify({ error: 'userId and productId are required' }),
        { status: 400 }
      );
    }

    // ✅ Validate productId format
    if (!isUUID(productId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid productId (must be UUID)' }),
        { status: 400 }
      );
    }

    // Find or create a cart for this user
    let cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await db.Cart.create({ userId });
    }

    // Check if product already exists in cart
    let item = await db.CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (item) {
      // Update quantity
      item.qty += qty;
      await item.save();
    } else {
      // Add new item
      item = await db.CartItem.create({
        cartId: cart.id,
        productId,
        qty,
      });
    }

    return new Response(
      JSON.stringify({ message: 'Item added to cart'}),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add to cart' }),
      { status: 500 }
    );
  }
}

// Empty Cart (delete cart and its items)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400 }
      );
    }

    const cart = await db.Cart.findOne({ where: { userId } });

    if (!cart) {
      return new Response(
        JSON.stringify({ error: 'Cart not found' }),
        { status: 404 }
      );
    }

    // Delete all items first (safe if ON DELETE CASCADE is not set)
    await db.CartItem.destroy({ where: { cartId: cart.id } });

    // Delete the cart itself
    await cart.destroy();

    return new Response(
      JSON.stringify({ message: 'Cart emptied successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error emptying cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to empty cart' }),
      { status: 500 }
    );
  }
}
