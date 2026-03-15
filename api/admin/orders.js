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
    console.log(`Admin Orders API Request: ${method} to /api/admin/orders`);

    switch (method) {
      case 'GET':
        // Get orders with filters
        let queryBuilder = supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (
                name,
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (query.status) {
          queryBuilder = queryBuilder.eq('status', query.status);
        }
        if (query.date_from) {
          queryBuilder = queryBuilder.gte('created_at', query.date_from);
        }
        if (query.date_to) {
          queryBuilder = queryBuilder.lte('created_at', query.date_to);
        }
        if (query.search) {
          queryBuilder = queryBuilder.or(`customer_name.ilike.%${query.search}%,customer_email.ilike.%${query.search}%,id.eq.${query.search}`);
        }

        const { data: orders, error } = await queryBuilder;
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch orders',
            details: error.message 
          });
        }

        return res.status(200).json(orders);

      case 'PUT':
        // Update order status
        const { id, status, tracking_number, notes } = body;
        
        if (!id) {
          return res.status(400).json({ error: 'Order ID is required' });
        }

        const updateData = {
          updated_at: new Date().toISOString()
        };

        if (status) updateData.status = status;
        if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
        if (notes !== undefined) updateData.notes = notes;

        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({ 
            error: 'Failed to update order',
            details: updateError.message 
          });
        }

        return res.status(200).json(updatedOrder);

      case 'DELETE':
        // Delete order (with caution)
        const orderId = query.id;
        
        if (!orderId) {
          return res.status(400).json({ error: 'Order ID is required' });
        }

        // First delete order items
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId);

        // Then delete order
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return res.status(500).json({ 
            error: 'Failed to delete order',
            details: deleteError.message 
          });
        }

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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
