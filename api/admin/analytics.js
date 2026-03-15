import { createClient } from '@supabase/supabase-js';
import { withAuth } from './middleware';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// CORS middleware
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

export default async function handler(req, res) {
  // Set CORS headers
  setCORSHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req;
    const days = parseInt(query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    console.log(`Admin Analytics Request: Last ${days} days`);

    // Get orders summary
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .gte('created_at', startDateStr);

    if (ordersError) {
      console.error('Orders error:', ordersError);
      return res.status(500).json({ 
        error: 'Failed to fetch orders data',
        details: ordersError.message 
      });
    }

    // Get products count
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (productsError) {
      console.error('Products error:', productsError);
    }

    // Calculate analytics
    const analytics = {
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
        totalProducts: totalProducts || 0,
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) / orders.length 
          : 0
      },
      ordersByStatus: {},
      dailySales: [],
      topProducts: []
    };

    // Orders by status
    orders.forEach(order => {
      const status = order.status || 'unknown';
      analytics.ordersByStatus[status] = (analytics.ordersByStatus[status] || 0) + 1;
    });

    // Daily sales data
    const dailyMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { date: dateStr, sales: 0, orders: 0 });
    }

    orders.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (dailyMap.has(date)) {
        const day = dailyMap.get(date);
        day.sales += parseFloat(order.total_amount || 0);
        day.orders += 1;
      }
    });

    analytics.dailySales = Array.from(dailyMap.values());

    // Get top products by sales
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        products (
          id,
          name,
          image_url
        )
      `)
      .gte('created_at', startDateStr);

    if (!itemsError && orderItems) {
      const productSales = new Map();
      
      orderItems.forEach(item => {
        if (item.products) {
          const productId = item.products.id;
          const existing = productSales.get(productId) || {
            id: productId,
            name: item.products.name,
            image_url: item.products.image_url,
            totalSold: 0,
            revenue: 0
          };
          
          existing.totalSold += item.quantity || 1;
          existing.revenue += (item.price || 0) * (item.quantity || 1);
          
          productSales.set(productId, existing);
        }
      });

      analytics.topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }

    return res.status(200).json(analytics);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
