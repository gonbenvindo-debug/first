import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.status(200).json(data);

      case 'POST':
        const { product } = req.body;
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([product])
          .select()
          .single();
        
        if (insertError) throw insertError;
        return res.status(201).json(newProduct);

      case 'PUT':
        const { id, ...updateData } = req.body;
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return res.status(200).json(updatedProduct);

      case 'DELETE':
        const { id: deleteId } = req.query;
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
