// ===================================
// SUPABASE CLIENT CONFIGURATION
// For Vercel + Supabase Integration
// ===================================

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client (for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Admin client (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Database helper functions
export const db = {
  // Products
  async getProducts(filters = {}) {
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
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.featured) {
      query = query.eq('featured', true);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, icon)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    return { data, error };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    return { data, error };
  },

  // Orders
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    return { data, error };
  },

  async createOrderItems(items) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();

    return { data, error };
  },

  async getOrdersByCustomer(customerId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Contacts
  async createContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();

    return { data, error };
  },

  // Newsletter
  async subscribeToNewsletter(email, firstName = '', lastName = '') {
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { data, error } = await supabase
      .from('newsletter')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        unsubscribe_token: unsubscribeToken
      })
      .select()
      .single();

    return { data, error };
  },

  async unsubscribeFromNewsletter(token) {
    const { data, error } = await supabase
      .from('newsletter')
      .update({ active: false })
      .eq('unsubscribe_token', token)
      .select()
      .single();

    return { data, error };
  },

  // Blog
  async getBlogPosts(limit = 10) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getBlogPostBySlug(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    return { data, error };
  },

  // Portfolio
  async getPortfolioItems(limit = 10) {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getPortfolioItemBySlug(slug) {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    return { data, error };
  },

  // Settings
  async getPublicSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('is_public', true);

    if (error) return { data: {}, error };

    // Convert to key-value object
    const settings = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });

    return { data: settings, error: null };
  },

  // Analytics
  async trackEvent(eventType, eventData = {}) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        event_data: eventData,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        referrer: typeof window !== 'undefined' ? document.referrer : null
      });

    return { data, error };
  },

  // File Upload
  async uploadFile(file, bucket = 'printcraft-uploads') {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) return { data: null, error };

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { data: { ...data, publicUrl }, error: null };
  },

  // Search
  async searchProducts(query) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, icon)
      `)
      .eq('status', 'active')
      .eq('in_stock', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// Realtime subscriptions
export const subscribeToTable = (table, callback, filter = '*') => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table,
        filter: filter
      }, 
      callback
    )
    .subscribe();
};

// Authentication helpers
export const auth = {
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Export default client
export default supabase;
