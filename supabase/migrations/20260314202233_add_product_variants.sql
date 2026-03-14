-- ===================================
-- ADICIONAR TABELA DE VARIANTES DE PRODUTO
-- Cada produto pode ter múltiplos tamanhos com preços diferentes
-- ===================================

-- Tabela de variantes (tamanhos)
CREATE TABLE product_variants (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size_label TEXT NOT NULL,
    width_cm INTEGER NOT NULL,
    height_cm INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    bleed_mm INTEGER DEFAULT 3,
    template_svg TEXT,
    in_stock BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_in_stock ON product_variants(in_stock);

-- RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variants are viewable by everyone" ON product_variants
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage variants" ON product_variants
    FOR ALL USING (true);

-- ===================================
-- INSERIR VARIANTES PARA FLYBANNERS
-- ===================================

-- Flybanner 2.5m variantes
INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Flybanner 2.5m - Pena', '60x250cm', 60, 250, 89.99, 5, 1 FROM products WHERE slug = 'flybanner-2-5m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Flybanner 2.5m - Gota', '70x250cm', 70, 250, 94.99, 5, 2 FROM products WHERE slug = 'flybanner-2-5m';

-- Flybanner 3.5m variantes
INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Flybanner 3.5m - Pena', '70x350cm', 70, 350, 119.99, 5, 1 FROM products WHERE slug = 'flybanner-3-5m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Flybanner 3.5m - Gota', '80x350cm', 80, 350, 129.99, 5, 2 FROM products WHERE slug = 'flybanner-3-5m';

-- Flybanner 4.5m variantes
INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Flybanner 4.5m - Pena', '80x450cm', 80, 450, 149.99, 5, 1 FROM products WHERE slug = 'flybanner-4-5m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Flybanner 4.5m - Gota', '90x450cm', 90, 450, 159.99, 5, 2 FROM products WHERE slug = 'flybanner-4-5m';

-- ===================================
-- INSERIR VARIANTES PARA ROLL-UPS
-- ===================================

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Roll-up Standard', '85x200cm', 85, 200, 49.99, 3, 1 FROM products WHERE slug = 'rollup-85x200-standard';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Roll-up Premium', '85x200cm', 85, 200, 79.99, 3, 1 FROM products WHERE slug = 'rollup-85x200-premium';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Roll-up Largo', '100x200cm', 100, 200, 69.99, 3, 1 FROM products WHERE slug = 'rollup-100x200';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Roll-up Extra Largo', '120x200cm', 120, 200, 89.99, 3, 1 FROM products WHERE slug = 'rollup-120x200';

-- ===================================
-- INSERIR VARIANTES PARA X-BANNERS
-- ===================================

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'X-Banner Pequeno', '60x160cm', 60, 160, 29.99, 3, 1 FROM products WHERE slug = 'xbanner-60x160';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'X-Banner Standard', '80x180cm', 80, 180, 39.99, 3, 1 FROM products WHERE slug = 'xbanner-80x180';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'X-Banner Grande', '120x200cm', 120, 200, 59.99, 3, 1 FROM products WHERE slug = 'xbanner-120x200';

-- ===================================
-- INSERIR VARIANTES PARA LONAS
-- ===================================

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Lona 1x1m', '100x100cm', 100, 100, 19.99, 5, 1 FROM products WHERE slug = 'lona-1x1m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Lona 2x1m', '200x100cm', 200, 100, 34.99, 5, 1 FROM products WHERE slug = 'lona-2x1m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Lona 3x1m', '300x100cm', 300, 100, 49.99, 5, 1 FROM products WHERE slug = 'lona-3x1m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Lona 3x2m', '300x200cm', 300, 200, 89.99, 5, 1 FROM products WHERE slug = 'lona-3x2m';

INSERT INTO product_variants (product_id, name, size_label, width_cm, height_cm, price, bleed_mm, sort_order)
SELECT id, 'Lona 4x2m', '400x200cm', 400, 200, 119.99, 5, 1 FROM products WHERE slug = 'lona-4x2m';