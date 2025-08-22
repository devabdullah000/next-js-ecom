import db from '@/../db/models';
import { validate as isUUID } from 'uuid';

export async function GET(_req, { params }) {
  try {
    const orderId = params.id;

    const order = await db.Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: db.OrderItem,
          as: 'items',
          include: [
            { model: db.Product, as: 'product', attributes: ['id', 'name', 'price'] }
          ]
        }
      ]
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(order, null, 2), { status: 200 });
  } catch (error) {
    console.error('Error fetching order items:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch order' }), { status: 500 });
  }
}