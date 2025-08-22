import db from '@/../db/models';

export async function GET(_req, { params }) {
  try {
    const { id } = params; // 👈 dynamic route param

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { status: 400 }
      );
    }

    // Fetch single product with images
    const product = await db.Product.findOne({
      where: { id },
      include: [
        {
          model: db.ProductImage,
          as: 'images',
          attributes: ['id', 'url'],
        },
      ],
    });

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(product, null, 2), { status: 200 });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch product details' }),
      { status: 500 }
    );
  }
}
