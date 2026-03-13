// ===================================
// API CONFIG - SERVER SIDE ONLY
// Não expor no frontend!
// ===================================

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY // Só no backend
};

// Helper para criar cliente admin
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
