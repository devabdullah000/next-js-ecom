import db from '@/../db/models';
import { v4 as uuidv4 } from 'uuid';

export async function PATCH(req, { params }) {
  try {
    const orderId = params.id;
    const { cancellationReason } = await req.json();

    if (!cancellationReason) {
      return new Response(JSON.stringify({ error: 'Cancellation reason is required' }), { status: 400 });
    }

    const order = await db.Order.findByPk(orderId);
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });

    order.status = 'cancelled';
    order.cancellationReason = cancellationReason;
    await order.save();

    return new Response(JSON.stringify({ message: 'Order cancelled' }), { status: 200 });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return new Response(JSON.stringify({ error: 'Failed to cancel order' }), { status: 500 });
  }
}