import db from '@/../db/models';
import { v4 as uuidv4 } from 'uuid';

//create order
export async function POST(req) {
  const transaction = await db.sequelize.transaction();
  try {
    const body = await req.json();
    const { userId, items } = body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'userId and items are required' }), { status: 400 });
    }

    // Generate unique UUID manually for order
    const orderId = uuidv4();

    // Create order within transaction
    const order = await db.Order.create(
      { id: orderId, userId },
      { transaction }
    );

    // Prepare order items
    const orderItems = items.map(item => ({
      orderId: order.id,
      productId: item.productId && typeof item.productId === 'string' ? item.productId : null,
      productName: item.productName,
      qty: item.qty,
      price: item.price,
    }));

    await db.OrderItem.bulkCreate(orderItems, { transaction });

    await transaction.commit();

    return new Response(JSON.stringify({ message: 'Order created', orderId: order.id }), { status: 201 });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500 });
  }
}

//get all orders
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page_number = parseInt(searchParams.get('page_number')) || 1;
    const page_size = parseInt(searchParams.get('page_size')) || 50;

    const offset = (page_number - 1) * page_size;
    const limit = page_size;

    const { rows: orders, count } = await db.Order.findAndCountAll({
      attributes: ['id', 'status', 'cancellationReason', 'refundReason'],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    return new Response(JSON.stringify({
      data: orders,
      pagination: { total: count, page_number, page_size, total_pages: Math.ceil(count / page_size) }
    }, null, 2), { status: 200 });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500 });
  }
}
