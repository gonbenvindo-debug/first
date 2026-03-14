// ===================================
// API ROUTES FOR PRODUCTS (SIMPLIFICADO)
// Vercel Serverless Functions
// ===================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/products
async function handleGet(req, res) {
  const { category, featured, slug } = req.query;

  // Produto único por slug
  if (slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json({ product: data });
  }

  // Lista de produtos
  let query = supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (featured === 'true') {
    query = query.eq('featured', true);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ products: data });
}

// POST /api/products
async function handlePost(req, res) {
  const { name, category, price, description, image_url, in_stock = true, featured = false } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, category, price' });
  }

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from('products')
    .insert({ name, slug, category, price: parseFloat(price), description, image_url, in_stock, featured })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Produto criado', product: data });
}

// DELETE /api/products
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID do produto é obrigatório' });
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Produto apagado' });
}
