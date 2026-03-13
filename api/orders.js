// ===================================
// API ROUTES FOR ORDERS
// Vercel Serverless Functions
// ===================================

import { supabase, supabaseAdmin } from '../lib/supabase.js';

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
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// GET /api/orders - Fetch orders
async function handleGet(req, res) {
  const { 
    customer_id, 
    status, 
    limit = 20, 
    offset = 0,
    order_number
  } = req.query;

  // If order_number is provided, get single order
  if (order_number) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('order_number', order_number)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({ order: data });
  }

  // Build query
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (customer_id) {
    query = query.eq('customer_id', customer_id);
  }
  if (status) {
    query = query.eq('status', status);
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
    orders: data,
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count || 0,
      hasMore: (offsetNum + limitNum) < (count || 0)
    }
  });
}

// POST /api/orders - Create new order
async function handlePost(req, res) {
  const {
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    billing_address,
    shipping_address,
    items,
    subtotal,
    tax_amount = 0,
    shipping_cost = 0,
    discount_amount = 0,
    total,
    notes,
    payment_method
  } = req.body;

  // Validate required fields
  if (!customer_name || !customer_email || !items || !total) {
    return res.status(400).json({ 
      error: 'Missing required fields: customer_name, customer_email, items, total' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' });
  }

  // Calculate totals if not provided
  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const calculatedTotal = calculatedSubtotal + (tax_amount || 0) + (shipping_cost || 0) - (discount_amount || 0);

  if (Math.abs(total - calculatedTotal) > 0.01) {
    return res.status(400).json({ error: 'Total amount mismatch' });
  }

  try {
    // Start a transaction by creating the order first
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        billing_address: billing_address || {},
        shipping_address: shipping_address || {},
        items,
        subtotal: calculatedSubtotal,
        tax_amount: tax_amount || 0,
        shipping_cost: shipping_cost || 0,
        discount_amount: discount_amount || 0,
        total: calculatedTotal,
        notes,
        payment_method,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      return res.status(400).json({ error: orderError.message });
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_sku: item.product_sku || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      specifications: item.specifications || {}
    }));

    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      // If order items fail, we should ideally rollback the order
      console.error('Failed to create order items:', itemsError);
      return res.status(400).json({ error: 'Failed to create order items' });
    }

    // Send confirmation email (this would be implemented with a service like Resend)
    try {
      await sendOrderConfirmationEmail(orderData, itemsData);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return res.status(201).json({ 
      message: 'Order created successfully',
      order: {
        ...orderData,
        items: itemsData
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}

// PUT /api/orders - Update order status
async function handlePut(req, res) {
  const { id } = req.query;
  const { status, payment_status, tracking_number, notes } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
  if (payment_status && !validPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({ error: 'Invalid payment status' });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (payment_status) updateData.payment_status = payment_status;
  if (tracking_number) updateData.tracking_number = tracking_number;
  if (notes !== undefined) updateData.notes = notes;

  // Set estimated delivery if status is 'shipped'
  if (status === 'shipped' && !tracking_number) {
    return res.status(400).json({ error: 'Tracking number is required when order is shipped' });
  }

  if (status === 'shipped') {
    updateData.estimated_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      order_items(*)
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Send status update email
  try {
    await sendOrderStatusUpdateEmail(data);
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
  }

  return res.status(200).json({ 
    message: 'Order updated successfully',
    order: data 
  });
}

// Helper functions
async function sendOrderConfirmationEmail(order, items) {
  // This would integrate with an email service like Resend
  console.log('Sending order confirmation email for order:', order.order_number);
  
  // Example implementation with Resend:
  /*
  const { data, error } = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL,
      to: [order.customer_email],
      subject: `Order Confirmation - ${order.order_number}`,
      html: generateOrderConfirmationTemplate(order, items)
    })
  });
  */
}

async function sendOrderStatusUpdateEmail(order) {
  // This would integrate with an email service like Resend
  console.log('Sending order status update email for order:', order.order_number);
}

function generateOrderConfirmationTemplate(order, items) {
  // Generate HTML email template
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation - ${order.order_number}</h2>
      <p>Thank you for your order, ${order.customer_name}!</p>
      
      <h3>Order Details</h3>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
      
      <h3>Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${items.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.product_name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">€${item.unit_price.toFixed(2)}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">€${item.total_price.toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      
      <p>We'll notify you when your order ships.</p>
      <p>Best regards,<br>PrintCraft Team</p>
    </div>
  `;
}
