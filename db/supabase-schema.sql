-- ===================================
-- RESET E SIMPLIFICAÇÃO DA BASE DE DADOS
-- Apaga tudo e cria apenas o essencial para produtos
-- ===================================

-- Desativar RLS temporariamente para poder apagar
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS files DISABLE ROW LEVEL SECURITY;

-- Apagar views
DROP VIEW IF EXISTS active_products CASCADE;
DROP VIEW IF EXISTS orders_with_customers CASCADE;
DROP VIEW IF EXISTS order_stats CASCADE;

-- Apagar todas as tabelas existentes
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS newsletter CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Apagar funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS set_order_number() CASCADE;
DROP FUNCTION IF EXISTS create_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_product_slug() CASCADE;

-- ===================================
-- CRIAR SCHEMA SIMPLIFICADO
-- ===================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Tabela de Produtos (simples e direta)
CREATE TABLE products (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(featured);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ver produtos
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Política: inserir produtos (para admin)
CREATE POLICY "Anyone can insert products" ON products
    FOR INSERT WITH CHECK (true);

-- Política: atualizar produtos (para admin)
CREATE POLICY "Anyone can update products" ON products
    FOR UPDATE USING (true);

-- Política: apagar produtos (para admin)
CREATE POLICY "Anyone can delete products" ON products
    FOR DELETE USING (true);

-- ===================================
-- INSERIR PRODUTOS DE EXEMPLO
-- ===================================

INSERT INTO products (name, slug, category, price, description, image_url, in_stock, featured) VALUES
('Flyers A6', 'flyers-a6', 'flyers', 29.99, 'Flyers em papel couché 300g, formato A6. Ideal para promoções.', 'https://picsum.photos/seed/flyer-a6/400/300', true, true),
('Flyers A5', 'flyers-a5', 'flyers', 39.99, 'Flyers em papel cartão 350g, formato A5.', 'https://picsum.photos/seed/flyer-a5/400/300', true, false),
('Cartões de Visita', 'cartoes-visita', 'business-cards', 19.99, 'Cartões de visita em papel 350g, formato 90x50mm.', 'https://picsum.photos/seed/cards/400/300', true, true),
('Cartões Premium', 'cartoes-premium', 'business-cards', 34.99, 'Cartões em papel especial 400g com relevo.', 'https://picsum.photos/seed/cards-premium/400/300', true, false),
('Banner 2x1m', 'banner-2x1m', 'banners', 89.99, 'Banner em vinil 2x1m para exterior.', 'https://picsum.photos/seed/banner/400/300', true, true),
('Banner 3x2m', 'banner-3x2m', 'banners', 149.99, 'Banner gigante 3x2m para eventos.', 'https://picsum.photos/seed/banner-big/400/300', true, false),
('Autocolantes 5cm', 'autocolantes-5cm', 'stickers', 14.99, 'Autocolantes redondos 5cm em vinil.', 'https://picsum.photos/seed/stickers/400/300', true, false),
('Autocolantes 10cm', 'autocolantes-10cm', 'stickers', 16.99, 'Autocolantes quadrados 10x10cm.', 'https://picsum.photos/seed/stickers-big/400/300', true, false);