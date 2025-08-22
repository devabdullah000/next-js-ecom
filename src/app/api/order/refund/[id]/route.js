import db from '@/../db/models';
import { validate as isUUID } from 'uuid';

export async function PATCH(req, { params }) {
  try {
    const orderId = params.id;
    const { refundReason } = await req.json();

    if (!refundReason) {
      return new Response(JSON.stringify({ error: 'Refund reason is required' }), { status: 400 });
    }

    const order = await db.Order.findByPk(orderId);
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });

    order.status = 'refunded';
    order.refundReason = refundReason;
    await order.save();

    return new Response(JSON.stringify({ message: 'Order refunded' }), { status: 200 });
  } catch (error) {
    console.error('Error refunding order:', error);
    return new Response(JSON.stringify({ error: 'Failed to refund order' }), { status: 500 });
  }
}
