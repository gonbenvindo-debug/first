export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock data for now
  const mockData = {
    summary: {
      totalOrders: 150,
      totalRevenue: 15420.50,
      totalProducts: 45,
      averageOrderValue: 102.80
    },
    ordersByStatus: {
      pending: 25,
      processing: 40,
      shipped: 60,
      delivered: 25
    },
    dailySales: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sales: Math.random() * 2000 + 500,
      orders: Math.floor(Math.random() * 20) + 5
    })),
    topProducts: [
      { id: 1, name: 'Flybanner Standard', image_url: '/images/products/flybanner.jpg', totalSold: 45, revenue: 2250 },
      { id: 2, name: 'Roll-up Premium', image_url: '/images/products/rollup.jpg', totalSold: 38, revenue: 3420 },
      { id: 3, name: 'X-Banner Pro', image_url: '/images/products/xbanner.jpg', totalSold: 32, revenue: 1920 }
    ]
  };

  return res.status(200).json(mockData);
}
