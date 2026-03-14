-- ===================================
-- ATUALIZAR PRODUTOS PARA PUBLICIDADE OUTDOOR/INDOOR
-- Flybanners, Roll-ups, X-Banners, Lonas
-- ===================================

-- Apagar produtos antigos
DELETE FROM products;

-- Inserir novos produtos de publicidade outdoor/indoor
INSERT INTO products (name, slug, category, price, description, image_url, in_stock, featured) VALUES

-- FLYBANNERS
('Flybanner 2.5m', 'flybanner-2-5m', 'flybanners', 89.99, 'Flybanner com 2.5m de altura, estrutura em fibra de vidro resistente. Inclui base, estaca e bolsa de transporte. Ideal para eventos outdoor.', 'https://picsum.photos/seed/flybanner-25/400/300', true, true),
('Flybanner 3.5m', 'flybanner-3-5m', 'flybanners', 119.99, 'Flybanner com 3.5m de altura, estrutura reforçada em fibra de vidro. Inclui base rotativa, estaca e bolsa. Máxima visibilidade.', 'https://picsum.photos/seed/flybanner-35/400/300', true, true),
('Flybanner 4.5m', 'flybanner-4-5m', 'flybanners', 149.99, 'Flybanner gigante com 4.5m de altura. Estrutura premium em fibra de vidro. Inclui base de água/areia, estaca e bolsa profissional.', 'https://picsum.photos/seed/flybanner-45/400/300', true, false),
('Flybanner 5.5m', 'flybanner-5-5m', 'flybanners', 189.99, 'Flybanner extra grande com 5.5m de altura. Estrutura ultra-resistente. Visibilidade máxima para grandes eventos e feiras.', 'https://picsum.photos/seed/flybanner-55/400/300', true, false),
('Flybanner Gota 3m', 'flybanner-gota-3m', 'flybanners', 99.99, 'Flybanner formato gota com 3m de altura. Design moderno e elegante. Inclui base e bolsa de transporte.', 'https://picsum.photos/seed/flybanner-gota/400/300', true, true),
('Flybanner Retângulo 3m', 'flybanner-retangulo-3m', 'flybanners', 109.99, 'Flybanner formato retangular com 3m de altura. Maior área de impressão. Inclui base e acessórios.', 'https://picsum.photos/seed/flybanner-rect/400/300', true, false),

-- ROLL-UPS
('Roll-up 85x200cm Standard', 'rollup-85x200-standard', 'rollups', 49.99, 'Roll-up standard 85x200cm em alumínio. Impressão em lona de alta qualidade. Inclui bolsa de transporte. Montagem em segundos.', 'https://picsum.photos/seed/rollup-standard/400/300', true, true),
('Roll-up 85x200cm Premium', 'rollup-85x200-premium', 'rollups', 79.99, 'Roll-up premium 85x200cm em alumínio reforçado. Lona anti-reflexo de alta definição. Base estável e bolsa profissional.', 'https://picsum.photos/seed/rollup-premium/400/300', true, true),
('Roll-up 100x200cm', 'rollup-100x200', 'rollups', 69.99, 'Roll-up largo 100x200cm. Maior área de impressão para mais impacto visual. Estrutura em alumínio resistente.', 'https://picsum.photos/seed/rollup-100/400/300', true, false),
('Roll-up 120x200cm', 'rollup-120x200', 'rollups', 89.99, 'Roll-up extra largo 120x200cm. Ideal para mensagens com mais conteúdo. Estrutura premium em alumínio.', 'https://picsum.photos/seed/rollup-120/400/300', true, false),
('Roll-up Dupla Face', 'rollup-dupla-face', 'rollups', 99.99, 'Roll-up dupla face 85x200cm. Visibilidade dos dois lados. Perfeito para corredores e entradas.', 'https://picsum.photos/seed/rollup-dupla/400/300', true, false),

-- X-BANNERS
('X-Banner 60x160cm', 'xbanner-60x160', 'xbanners', 29.99, 'X-Banner económico 60x160cm. Estrutura leve em alumínio. Fácil montagem e transporte. Ideal para promoções.', 'https://picsum.photos/seed/xbanner-60/400/300', true, true),
('X-Banner 80x180cm', 'xbanner-80x180', 'xbanners', 39.99, 'X-Banner standard 80x180cm. Estrutura resistente. Impressão em lona de qualidade. Inclui bolsa.', 'https://picsum.photos/seed/xbanner-80/400/300', true, true),
('X-Banner 120x200cm', 'xbanner-120x200', 'xbanners', 59.99, 'X-Banner grande 120x200cm. Máximo impacto visual. Estrutura reforçada para uso intensivo.', 'https://picsum.photos/seed/xbanner-120/400/300', true, false),

-- LONAS
('Lona Publicitária 1x1m', 'lona-1x1m', 'lonas', 19.99, 'Lona publicitária 1x1m em vinil 440g. Impressão full color de alta resolução. Acabamento com olhais.', 'https://picsum.photos/seed/lona-1x1/400/300', true, false),
('Lona Publicitária 2x1m', 'lona-2x1m', 'lonas', 34.99, 'Lona publicitária 2x1m em vinil 440g. Impressão UV resistente. Ideal para exterior. Acabamento profissional.', 'https://picsum.photos/seed/lona-2x1/400/300', true, true),
('Lona Publicitária 3x1m', 'lona-3x1m', 'lonas', 49.99, 'Lona publicitária 3x1m em vinil premium 500g. Alta durabilidade para exterior. Cores vibrantes.', 'https://picsum.photos/seed/lona-3x1/400/300', true, true),
('Lona Publicitária 3x2m', 'lona-3x2m', 'lonas', 89.99, 'Lona publicitária grande 3x2m em vinil 500g. Perfeita para fachadas e eventos. Impressão HD.', 'https://picsum.photos/seed/lona-3x2/400/300', true, false),
('Lona Publicitária 4x2m', 'lona-4x2m', 'lonas', 119.99, 'Lona publicitária extra grande 4x2m. Vinil premium 500g. Máxima visibilidade para grandes espaços.', 'https://picsum.photos/seed/lona-4x2/400/300', true, false),
('Lona Mesh 3x2m', 'lona-mesh-3x2m', 'lonas', 99.99, 'Lona mesh perfurada 3x2m. Ideal para fachadas com vento. Permite passagem de ar. Impressão de alta qualidade.', 'https://picsum.photos/seed/lona-mesh/400/300', true, false),
('Lona Backlight 2x1m', 'lona-backlight-2x1m', 'lonas', 79.99, 'Lona backlight 2x1m para caixas de luz. Translúcida com impressão vibrante. Efeito luminoso impressionante.', 'https://picsum.photos/seed/lona-backlight/400/300', true, false);