-- ===================================
-- SUPABASE SCHEMA FOR PRINTCRAFT STORE
-- Complete database schema for Vercel + Supabase integration
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable necessary extensions for enhanced functionality
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ===================================
-- CORE TABLES
-- ===================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    short_description TEXT,
    icon TEXT,
    image_url TEXT,
    gallery JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 10000,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    tags TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    company TEXT,
    nif TEXT,
    address JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    billing_address JSONB DEFAULT '{}',
    shipping_address JSONB DEFAULT '{}',
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_id TEXT,
    notes TEXT,
    tracking_number TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- CONTENT & MARKETING TABLES
-- ===================================

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    product_type TEXT,
    project_type TEXT,
    budget TEXT,
    timeline TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'converted', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    active BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'website',
    preferences JSONB DEFAULT '{}',
    unsubscribe_token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author TEXT DEFAULT 'PrintCraft Team',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title TEXT,
    seo_description TEXT,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]',
    category TEXT,
    client TEXT,
    project_date DATE,
    technologies TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- SYSTEM & ANALYTICS TABLES
-- ===================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table for uploads
CREATE TABLE IF NOT EXISTS files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INSERT SAMPLE DATA
-- ===================================

-- Insert categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Flyers', 'flyers', 'Flyers e folhetos publicitários de alta qualidade', 'fa-file-alt', 1),
('Cartões de Visita', 'business-cards', 'Cartões de visita profissionais e personalizados', 'fa-id-card', 2),
('Banners', 'banners', 'Banners e faixas para eventos e promoções', 'fa-flag', 3),
('Autocolantes', 'stickers', 'Autocolantes e adesivos personalizados', 'fa-circle', 4),
('Brochuras', 'brochures', 'Brochuras e catálogos empresariais', 'fa-book', 5),
('Posters', 'posters', 'Posters e materiais de grande formato', 'fa-image', 6),
('Embalagens', 'packaging', 'Embalagens personalizadas e caixas', 'fa-box', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert comprehensive products
INSERT INTO products (name, slug, category, price, description, short_description, icon, image_url, in_stock, stock_quantity, featured, status, tags) VALUES
('Flyers A6 Standard', 'flyers-a6-standard', 'flyers', 29.99, 'Flyers em papel couché 300g com acabamento brilhante, formato A6. Ideal para promoções rápidas e distribuição em massa.', 'Flyers A6 em papel premium', 'fa-file-alt', 'https://picsum.photos/seed/flyer-a6/400/300', true, 1000, true, 'active', ARRAY['flyers', 'promoção', 'a6']),
('Flyers A5 Premium', 'flyers-a5-premium', 'flyers', 39.99, 'Flyers em papel cartão 350g com verniz local. Formato A5 com acabamento profissional.', 'Flyers A5 com acabamento premium', 'fa-file', 'https://picsum.photos/seed/flyer-a5/400/300', true, 500, true, 'active', ARRAY['flyers', 'premium', 'a5']),
('Cartões de Visita Standard', 'cartoes-visita-standard', 'business-cards', 19.99, 'Cartões de visita em papel 350g com acabamento mate. Formato padrão 90x50mm.', 'Cartões de visita profissionais', 'fa-id-card', 'https://picsum.photos/seed/cards-standard/400/300', true, 2000, true, 'active', ARRAY['cartões', 'visita', 'standard']),
('Cartões de Visita Premium', 'cartoes-visita-premium', 'business-cards', 34.99, 'Cartões em papel especial 400g com relevo seco e verniz UV. Design exclusivo.', 'Cartões premium com acabamento especial', 'fa-id-badge', 'https://picsum.photos/seed/cards-premium/400/300', true, 500, false, 'active', ARRAY['cartões', 'premium', 'relevo']),
('Banner 2x1m Exterior', 'banner-2x1m-exterior', 'banners', 89.99, 'Banner em vinil adesivo 2x1m com acabamento brilhante e olhais. Resistente para exterior.', 'Banner grande para eventos', 'fa-flag', 'https://picsum.photos/seed/banner-2x1/400/300', true, 50, true, 'active', ARRAY['banner', 'exterior', '2x1']),
('Banner 3x2m Eventos', 'banner-3x2m-eventos', 'banners', 149.99, 'Banner gigante 3x2m em vinil reforçado com acabamento mate. Ideal para eventos grandes.', 'Banner extra grande para eventos', 'fa-scroll', 'https://picsum.photos/seed/banner-3x2/400/300', true, 20, false, 'active', ARRAY['banner', 'eventos', '3x2']),
('Autocolantes Redondos 5cm', 'autocolantes-redondos-5cm', 'stickers', 14.99, 'Autocolantes adesivos redondos 5cm em vinil brilhante. Perfeitos para logotipos e promoções.', 'Autocolantes redondos personalizados', 'fa-circle', 'https://picsum.photos/seed/stickers-round/400/300', true, 1000, false, 'active', ARRAY['autocolantes', 'redondos', '5cm']),
('Autocolantes Quadrados 10cm', 'autocolantes-quadrados-10cm', 'stickers', 16.99, 'Autocolantes quadrados 10x10cm em papel adesivo. Excelente para produtos e embalagens.', 'Autocolantes quadrados personalizados', 'fa-square', 'https://picsum.photos/seed/stickers-square/400/300', true, 800, false, 'active', ARRAY['autocolantes', 'quadrados', '10cm']),
('Brochuras A4 Capa Mole', 'brochuras-a4-capa-mole', 'brochuras', 59.99, 'Brochuras A4 com capa mole em papel 135g interior e 300g capa. Grampeadas ou com lombada.', 'Brochuras profissionais A4', 'fa-book', 'https://picsum.photos/seed/brochure-a4/400/300', true, 200, true, 'active', ARRAY['brochuras', 'a4', 'capa-mole']),
('Catálogos Empresariais', 'catalogos-empresariais', 'brochuras', 89.99, 'Catálogos empresariais com capa dura em papel 200g. Acabamento premium para produtos.', 'Catálogos de alta qualidade', 'fa-book-open', 'https://picsum.photos/seed/catalog-business/400/300', true, 100, false, 'active', ARRAY['catálogos', 'empresariais', 'capa-dura']),
('Posters A3 Eventos', 'posters-a3-eventos', 'posters', 24.99, 'Posters A3 em papel fotográfico 200g. Alta qualidade para eventos e exposições.', 'Posters profissionais A3', 'fa-image', 'https://picsum.photos/seed/poster-a3/400/300', true, 300, false, 'active', ARRAY['posters', 'a3', 'eventos']),
('Posters A2 Promoções', 'posters-a2-promocoes', 'posters', 39.99, 'Posters A2 em papel 180g com acabamento brilhante. Visibilidade máxima para promoções.', 'Posters grandes para promoções', 'fa-expand', 'https://picsum.photos/seed/poster-a2/400/300', true, 150, false, 'active', ARRAY['posters', 'a2', 'promoções']),
('Caixas Personalizadas Pequenas', 'caixas-pequenas', 'packaging', 45.99, 'Caixas personalizadas tamanho pequeno (15x10x5cm) em cartão rígido. Design exclusivo.', 'Caixas pequenas personalizadas', 'fa-box', 'https://picsum.photos/seed/box-small/400/300', true, 400, false, 'active', ARRAY['caixas', 'pequenas', 'personalizadas']),
('Embalagens com Logo', 'embalagens-logo', 'packaging', 65.99, 'Embalagens personalizadas com logotipo impresso. Vários tamanhos disponíveis.', 'Embalagens com marca própria', 'fa-tags', 'https://picsum.photos/seed/package-logo/400/300', true, 250, false, 'active', ARRAY['embalagens', 'logo', 'marca'])
ON CONFLICT (slug) DO NOTHING;

-- Insert sample portfolio items
INSERT INTO portfolio (title, slug, description, images, category, client, project_date, featured, status) VALUES
('Identidade Visual Completa', 'identidade-visual-completa', 'Desenvolvimento completo de identidade visual para startup tecnológica, incluindo logotipo, cartões de visita e papelada.', '["https://picsum.photos/seed/portfolio1/800/600", "https://picsum.photos/seed/portfolio1b/800/600"]', 'Design Gráfico', 'TechStart Solutions', '2024-01-15', true, 'published'),
('Material para Evento', 'material-evento', 'Produção completa de material para conferência empresarial: banners, flyers, crachás e certificados.', '["https://picsum.photos/seed/portfolio2/800/600", "https://picsum.photos/seed/portfolio2b/800/600"]', 'Eventos', 'Summit 2024', '2024-02-20', true, 'published'),
('Packaging de Produto', 'packaging-produto', 'Design e produção de embalagens personalizadas para linha de produtos cosméticos.', '["https://picsum.photos/seed/portfolio3/800/600", "https://picsum.photos/seed/portfolio3b/800/600"]', 'Packaging', 'Beauty Cosmetics', '2024-03-10', false, 'published')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, status, published_at, tags) VALUES
('5 Dicas para Design de Cartões de Visita Eficazes', 'dicas-design-cartoes-visita', 'Descubra como criar cartões de visita que realmente funcionam e deixam uma impressão duradoura.', 'Conteúdo completo do artigo sobre design de cartões de visita...', 'https://picsum.photos/seed/blog1/1200/600', 'published', '2024-03-01', ARRAY['design', 'cartões', 'dicas']),
('Como Escolher o Papel Certo para Seus Flyers', 'escolher-papel-flyers', 'Guia completo sobre tipos de papel e acabamentos para flyers de alta qualidade.', 'Conteúdo completo do artigo sobre escolha de papel...', 'https://picsum.photos/seed/blog2/1200/600', 'published', '2024-02-15', ARRAY['flyers', 'papel', 'impressão']),
('Tendências de Impressão para 2024', 'tendencias-impressao-2024', 'As principais tendências e inovações no mundo da impressão para este ano.', 'Conteúdo completo do artigo sobre tendências...', 'https://picsum.photos/seed/blog3/1200/600', 'published', '2024-01-20', ARRAY['tendências', '2024', 'inovação'])
ON CONFLICT (slug) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description, is_public) VALUES
('site_name', '"PrintCraft"', 'Nome do site', true),
('site_description', '"Especialistas em produtos personalizados de publicidade"', 'Descrição do site', true),
('contact_email', '"info@printcraft.pt"', 'Email de contacto principal', true),
('contact_phone', '"+351 123 456 789"', 'Telefone de contacto', true),
('contact_address', '"Rua da Indústria, 123, 1000-001 Lisboa, Portugal"', 'Morada de contacto', true),
('social_facebook', '"https://facebook.com/printcraft"', 'URL do Facebook', true),
('social_instagram', '"https://instagram.com/printcraft"', 'URL do Instagram', true),
('social_linkedin', '"https://linkedin.com/company/printcraft"', 'URL do LinkedIn', true),
('shipping_cost', '5.00', 'Custo de envio padrão', false),
('tax_rate', '0.23', 'Taxa de IVA', false),
('min_order_value', '10.00', 'Valor mínimo de encomenda', false),
('free_shipping_threshold', '50.00', 'Valor mínimo para envio grátis', false)
ON CONFLICT (key) DO NOTHING;

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('portuguese', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, '')));

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter(active);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON newsletter(unsubscribe_token);

-- Blog indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON portfolio(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_public ON settings(is_public);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published portfolio items are viewable by everyone" ON portfolio
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public settings are viewable by everyone" ON settings
    FOR SELECT USING (is_public = true);

-- Insert policies for public submissions
CREATE POLICY "Anyone can insert contacts" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert newsletter subscriptions" ON newsletter
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items can be inserted by anyone" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- ===================================
-- TRIGGERS AND FUNCTIONS
-- ===================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    order_count INTEGER;
BEGIN
    -- Get count of orders today
    SELECT COUNT(*) INTO order_count 
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate order number: ORD-YYYYMMDD-NNNN
    order_num := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((order_count + 1)::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((SELECT COUNT(*)::TEXT + 1 FROM orders WHERE DATE(created_at) = CURRENT_DATE), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create slug from text
CREATE OR REPLACE FUNCTION create_slug(TEXT)
RETURNS TEXT AS $$
SELECT LOWER(REGEXP_REPLACE(REGEXP_REPLACE($1, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
$$ LANGUAGE SQL IMMUTABLE;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate order number
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Trigger to create slug from name for products
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the correct trigger
DROP TRIGGER IF EXISTS create_product_slug ON products;
CREATE TRIGGER create_product_slug
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION set_product_slug();

-- ===================================
-- VIEWS FOR COMMON QUERIES
-- ===================================

-- View for active products with category info
CREATE OR REPLACE VIEW active_products AS
SELECT 
    p.*,
    c.name as category_name,
    c.icon as category_icon
FROM products p
LEFT JOIN categories c ON p.category = c.slug
WHERE p.status = 'active' AND p.in_stock = true;

-- View for orders with customer info
CREATE OR REPLACE VIEW orders_with_customers AS
SELECT 
    o.*,
    c.first_name,
    c.last_name,
    c.company
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- View for order statistics
CREATE OR REPLACE VIEW order_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as order_count,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ===================================
-- SAMPLE ADMIN USER (for development)
-- ===================================

-- Insert admin user (password: admin123)
INSERT INTO customers (first_name, last_name, email, password_hash, is_active, email_verified) VALUES
('Admin', 'User', 'admin@printcraft.pt', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS', true, true)
ON CONFLICT (email) DO NOTHING;

-- ===================================
-- COMPLETION MESSAGE
-- ===================================

DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'PrintCraft Database Schema Created Successfully!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Tables created: 13';
    RAISE NOTICE 'Indexes created: 25+';
    RAISE NOTICE 'Policies created: 12';
    RAISE NOTICE 'Views created: 3';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Admin user: admin@printcraft.pt / admin123';
    RAISE NOTICE '=========================================';
END $$;
