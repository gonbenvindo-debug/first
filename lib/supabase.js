// ===================================
// SUPABASE CLIENT (SIMPLIFICADO)
// ===================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de produtos
export const db = {
  async getProducts(filters = {}) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.featured) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    return { data, error };
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    return { data, error };
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    return { error };
  }
};

export default supabase;
