// ===================================
// API ROUTES FOR PRODUCTS
// Vercel Serverless Functions
// ===================================

import { createClient } from '@supabase/supabase-js';

// Cliente Supabase (só com anon key - seguro)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// GET /api/products - Fetch products
async function handleGet(req, res) {
  const { 
    category, 
    featured, 
    search, 
    limit = 20, 
    offset = 0,
    slug 
  } = req.query;

  // If slug is provided, get single product
  if (slug) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, icon)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ product: data });
  }

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(name, icon)
    `)
    .eq('status', 'active')
    .eq('in_stock', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  // Apply filters
  if (category) {
    query = query.eq('category', category);
  }
  if (featured === 'true') {
    query = query.eq('featured', true);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`);
  }

  // Apply pagination
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  query = query.range(offsetNum, offsetNum + limitNum - 1);

  const { data, error, count } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({
    products: data,
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count || 0,
      hasMore: (offsetNum + limitNum) < (count || 0)
    }
  });
}

// POST /api/products - Create new product (admin only)
async function handlePost(req, res) {
  const {
    name,
    category,
    price,
    description,
    short_description,
    image_url,
    in_stock = true,
    stock_quantity = 0,
    featured = false,
    status = 'active',
    tags = []
  } = req.body;

  // Validate required fields
  if (!name || !category || !price) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, category, price' 
    });
  }

  // Create slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name,
      slug,
      category,
      price: parseFloat(price),
      description,
      short_description,
      image_url,
      in_stock,
      stock_quantity,
      featured,
      status,
      tags
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ 
    message: 'Product created successfully',
    product: data 
  });
}

// PUT /api/products - Update product (admin only)
async function handlePut(req, res) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Remove fields that shouldn't be updated directly
  delete updateData.id;
  delete updateData.created_at;
  delete updateData.updated_at;

  // Update slug if name changed
  if (updateData.name) {
    updateData.slug = updateData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(200).json({ 
    message: 'Product updated successfully',
    product: data 
  });
}

// DELETE /api/products - Delete product (admin only)
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Soft delete by setting status to 'archived'
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(200).json({ 
    message: 'Product deleted successfully',
    product: data 
  });
}
