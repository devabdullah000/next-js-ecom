import db from '@/../db/models';
import { validate as isUUID } from 'uuid';

//get user orders
export async function GET(_req, { params }) {
  try {
    const userId = params.id;

    const orders = await db.Order.findAll({
      where: { userId },
      attributes: ['id', 'status', 'cancellationReason', 'refundReason'],
      order: [['createdAt', 'DESC']],
    });

    return new Response(JSON.stringify(orders, null, 2), { status: 200 });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const orderId = params.id;

    // Fetch the order
    const order = await db.Order.findByPk(orderId);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    // Only allow confirming if order is pending
    if (order.status !== 'pending') {
      return new Response(JSON.stringify({ error: `Cannot confirm order in '${order.status}' status` }), { status: 400 });
    }

    // Update status to 'processing' (confirmed)
    order.status = 'processing';
    await order.save();

    return new Response(JSON.stringify({ message: 'Order confirmed', orderId: order.id, status: order.status }), { status: 200 });
  } catch (error) {
    console.error('Error confirming order:', error);
    return new Response(JSON.stringify({ error: 'Failed to confirm order' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const orderId = params.id;

    // Fetch the order
    const order = await db.Order.findByPk(orderId);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    // Only allow marking as delivered if order is processing
    if (order.status !== 'processing') {
      return new Response(
        JSON.stringify({ error: `Cannot mark order as delivered in '${order.status}' status` }),
        { status: 400 }
      );
    }

    // Update status to 'delivered'
    order.status = 'delivered';
    await order.save();

    return new Response(
      JSON.stringify({ message: 'Order marked as delivered', orderId: order.id, status: order.status }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    return new Response(JSON.stringify({ error: 'Failed to mark order as delivered' }), { status: 500 });
  }
}