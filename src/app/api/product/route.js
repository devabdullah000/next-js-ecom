import db from '@/../db/models';

export async function GET(req) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page_number = parseInt(searchParams.get('page_number')) || 1;
    const page_size = parseInt(searchParams.get('page_size')) || 50;
    const search = searchParams.get('search')?.trim() || '';

    // Pagination logic
    const offset = (page_number - 1) * page_size;
    const limit = page_size;

    // Search by name only (case-insensitive, works for SQLite & Postgres)
    const where = search
      ? db.sequelize.where(
          db.sequelize.fn('LOWER', db.sequelize.col('name')),
          {
            [db.Sequelize.Op.like]: `%${search.toLowerCase()}%`,
          }
        )
      : {};

    // Fetch products with associations, pagination, and search
    const { rows: products, count } = await db.Product.findAndCountAll({
      where,
      attributes: { exclude: ['description', 'note'] },
      include: [
        {
          model: db.ProductImage,
          as: 'images',
          attributes: ['id', 'url'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    return new Response(
      JSON.stringify(
        {
          data: products,
          pagination: {
            total: count,
            page_number,
            page_size,
            total_pages: Math.ceil(count / page_size),
          },
        },
        null,
        2
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { status: 500 }
    );
  }
}
