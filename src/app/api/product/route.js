import db from '@/../db/models';

export async function GET() {
  try {
    const products = await db.Product.findAll({
      include: [
        {
          model: db.ProductImage,
          as: 'images', // must match association alias in Product model
          attributes: ['id', 'url'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return new Response(JSON.stringify(products, null, 2), { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { status: 500 }
    );
  }
}
