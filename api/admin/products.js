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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

export default withAuth(async function handler(req, res) {
  // Set CORS headers
  setCORSHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    console.log(`Admin API Request: ${method} to /api/admin/products`);

    switch (method) {
      case 'GET':
        // Get all products with optional filters
        let queryBuilder = supabase
          .from('products')
          .select(`
            *,
            product_variants (
              id,
              sku,
              price,
              stock,
              sort_order
            )
          `)
          .order('created_at', { ascending: false });

        // Apply filters if provided
        if (query.category) {
          queryBuilder = queryBuilder.eq('category', query.category);
        }
        if (query.in_stock !== undefined) {
          queryBuilder = queryBuilder.eq('in_stock', query.in_stock === 'true');
        }
        if (query.search) {
          queryBuilder = queryBuilder.ilike('name', `%${query.search}%`);
        }

        const { data: products, error } = await queryBuilder;
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
          });
        }

        return res.status(200).json(products);

      case 'POST':
        // Create new product
        const newProduct = {
          name: body.name,
          slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: body.description || '',
          category: body.category,
          base_price: parseFloat(body.base_price),
          image_url: body.image_url || '',
          in_stock: body.in_stock !== undefined ? body.in_stock : true,
          featured: body.featured || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProduct, error: createError } = await supabase
          .from('products')
          .insert([newProduct])
          .select()
          .single();

        if (createError) {
          console.error('Create error:', createError);
          return res.status(500).json({ 
            error: 'Failed to create product',
            details: createError.message 
          });
        }

        // Add variants if provided
        if (body.variants && body.variants.length > 0) {
          const variants = body.variants.map(v => ({
            product_id: createdProduct.id,
            sku: v.sku,
            price: parseFloat(v.price),
            stock: parseInt(v.stock),
            sort_order: v.sort_order || 0
          }));

          const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(variants);

          if (variantsError) {
            console.error('Variants error:', variantsError);
          }
        }

        return res.status(201).json(createdProduct);

      case 'PUT':
        // Update product
        const { id, ...updateData } = body;
        
        if (!id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const updatePayload = {
          ...updateData,
          updated_at: new Date().toISOString()
        };

        // Remove fields that shouldn't be updated directly
        delete updatePayload.id;
        delete updatePayload.created_at;

        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({ 
            error: 'Failed to update product',
            details: updateError.message 
          });
        }

        // Update variants if provided
        if (body.variants) {
          // Delete existing variants
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', id);

          // Insert new variants
          if (body.variants.length > 0) {
            const variants = body.variants.map(v => ({
              product_id: id,
              sku: v.sku,
              price: parseFloat(v.price),
              stock: parseInt(v.stock),
              sort_order: v.sort_order || 0
            }));

            await supabase
              .from('product_variants')
              .insert(variants);
          }
        }

        return res.status(200).json(updatedProduct);

      case 'DELETE':
        // Delete product
        const productId = query.id;
        
        if (!productId) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        // First delete variants
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId);

        // Then delete product
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return res.status(500).json({ 
            error: 'Failed to delete product',
            details: deleteError.message 
          });
        }

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
