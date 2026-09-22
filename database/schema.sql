-- ==============================================================================
-- PROJETO INTEGRADOR TRANSDISCIPLINAR EM SISTEMAS DE INFORMAÇÃO II (PIT II)
-- PROJETO FÍSICO DE BANCO DE DADOS RELACIONAL: SWEET BLISS CUPCAKES
-- ==============================================================================
-- Sistema: Sweet Bliss Cupcakes — Confeitaria Artesanal & Delivery
-- Situação-Problema 2: Padrão Arquitetural MVC e Persistência Relacional
-- Compatibilidade SGBD: MySQL 8.0+ / PostgreSQL 14+ / MariaDB 10.5+
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CRIAÇÃO DO BANCO DE DADOS (SCHEMA DDL)
-- ------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS sweet_bliss_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sweet_bliss_db;

-- ------------------------------------------------------------------------------
-- 2. REMOÇÃO PREVENTIVA DE TABELAS (DROP IF EXISTS NA ORDEM CORRETA DE FK)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cupcake_allergens;
DROP TABLE IF EXISTS allergens;
DROP TABLE IF EXISTS cupcakes;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------------------------
-- 3. CRIAÇÃO DAS TABELAS RELACIONAIS (DDL COM CONSTRAINTS E ÍNDICES)
-- ------------------------------------------------------------------------------

-- 3.1 Tabela: users (Usuários, Clientes e Administradores)
CREATE TABLE users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  phone VARCHAR(20),
  birth_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT chk_users_email CHECK (email LIKE '%@%.%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3.2 Tabela: cupcakes (Catálogo de Produtos e Informações Nutricionais)
CREATE TABLE cupcakes (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category ENUM('Gourmet', 'Vegano', 'Zero Açúcar', 'Sazonais') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  promo_price DECIMAL(10, 2) NULL,
  image_url VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  in_stock INT NOT NULL DEFAULT 0,
  calories INT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_cupcakes PRIMARY KEY (id),
  CONSTRAINT chk_cupcakes_price CHECK (price > 0),
  CONSTRAINT chk_cupcakes_promo_price CHECK (promo_price IS NULL OR promo_price > 0),
  CONSTRAINT chk_cupcakes_stock CHECK (in_stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cupcakes_category ON cupcakes(category);
CREATE INDEX idx_cupcakes_stock ON cupcakes(in_stock);

-- 3.3 Tabela: allergens (Dicionário Central de Alérgenos e Segurança Alimentar)
CREATE TABLE allergens (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(20) NOT NULL,
  description VARCHAR(255) NULL,
  CONSTRAINT pk_allergens PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.4 Tabela Associativa: cupcake_allergens (N:M entre Cupcakes e Alérgenos)
CREATE TABLE cupcake_allergens (
  cupcake_id VARCHAR(36) NOT NULL,
  allergen_id VARCHAR(36) NOT NULL,
  CONSTRAINT pk_cupcake_allergens PRIMARY KEY (cupcake_id, allergen_id),
  CONSTRAINT fk_ca_cupcake FOREIGN KEY (cupcake_id)
    REFERENCES cupcakes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ca_allergen FOREIGN KEY (allergen_id)
    REFERENCES allergens(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ca_cupcake ON cupcake_allergens(cupcake_id);
CREATE INDEX idx_ca_allergen ON cupcake_allergens(allergen_id);

-- 3.5 Tabela: orders (Cabeçalho de Pedidos, Endereçamento e Rastreamento)
CREATE TABLE orders (
  id VARCHAR(36) NOT NULL, -- Ex: 'PED-123456'
  user_id VARCHAR(36) NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(25) NOT NULL,
  customer_email VARCHAR(150) NULL,
  status ENUM('Aguardando Pagamento', 'Em Produção', 'Em Entrega', 'Entregue') NOT NULL DEFAULT 'Em Produção',
  payment_method ENUM('PIX', 'Cartão de Crédito', 'Dinheiro na Entrega') NOT NULL,
  payment_status ENUM('Pendente', 'Aprovado', 'Falhou') NOT NULL DEFAULT 'Aprovado',
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  coupon_code VARCHAR(30) NULL,
  -- Dados de Entrega / Retirada
  is_pickup BOOLEAN NOT NULL DEFAULT FALSE,
  street VARCHAR(200) NOT NULL,
  number VARCHAR(30) NOT NULL,
  complement VARCHAR(100) NULL,
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL DEFAULT 'SP',
  cep VARCHAR(15) NOT NULL,
  reference VARCHAR(255) NULL,
  -- IHC / Métricas Operacionais
  estimated_minutes INT NOT NULL DEFAULT 35,
  rating INT NULL,
  rating_feedback TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_orders PRIMARY KEY (id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_orders_total CHECK (total >= 0),
  CONSTRAINT chk_orders_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- 3.6 Tabela: order_items (Itens e Detalhamento Financeiro do Pedido)
CREATE TABLE order_items (
  id INT AUTO_INCREMENT NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  cupcake_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT pk_order_items PRIMARY KEY (id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id)
    REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_oi_cupcake FOREIGN KEY (cupcake_id)
    REFERENCES cupcakes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_oi_quantity CHECK (quantity > 0),
  CONSTRAINT chk_oi_prices CHECK (unit_price > 0 AND total_price >= unit_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_oi_order ON order_items(order_id);
CREATE INDEX idx_oi_cupcake ON order_items(cupcake_id);


-- ------------------------------------------------------------------------------
-- 4. CARGA INICIAL DE DADOS (DML INSERT INTO — MASSA DE DADOS DA VITRINE)
-- ------------------------------------------------------------------------------

-- 4.1 Inserção de Alérgenos Padrão
INSERT INTO allergens (id, name, icon, description) VALUES
('alg-01', 'Glúten', '🌾', 'Presente em cereais como trigo, centeio e cevada'),
('alg-02', 'Lactose', '🥛', 'Açúcar natural presente no leite de vaca e derivados'),
('alg-03', 'Ovos', '🥚', 'Proteína presente em ovos de galinha utilizados na massa'),
('alg-04', 'Nozes / Castanhas', '🥜', 'Frutos secos oleaginosos como nozes, castanhas e pistache'),
('alg-05', 'Soja', '🌱', 'Derivados de soja utilizados em chocolates e emulsificantes');

-- 4.2 Inserção de Usuários Sementes (Cliente Demo e Administrador)
INSERT INTO users (id, name, email, password_hash, role, phone, birth_date) VALUES
('usr-demo-1', 'Maria Silva', 'cliente@sweetbliss.com', '$2y$10$e8w.R21f2uT5O7rGg9vFhOn0V7Yg1N4zI8qD3kW1rM2bV6k9.senha123', 'customer', '(11) 98765-4321', '1995-05-15'),
('usr-admin-1', 'Administrador Sweet Bliss', 'admin@sweetbliss.com.br', '$2y$10$t5u.B82m1xP4A6qWw8eRhOn1Z8Xh2O5aJ9rE4lX2sN3cW7l0.admin123', 'admin', '(11) 99999-8888', '1988-10-20');

-- 4.3 Inserção dos 9 Cupcakes Oficiais da Vitrine
INSERT INTO cupcakes (id, name, category, price, promo_price, image_url, description, ingredients, in_stock, calories, rating) VALUES
(
  'cup-01',
  'Red Velvet Clássico Gourmet',
  'Gourmet',
  14.50,
  12.90,
  'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
  'Massa aveludada de cacau puro com suave toque de baunilha de Madagascar, recheada e coberta com autêntico frosting de cream cheese aerado.',
  'Farinha de trigo especial, Cacau em pó alcalino, Cream cheese premium, Manteiga sem sal, Açúcar demerara, Ovos frescos',
  18,
  320,
  4.90
),
(
  'cup-02',
  'Chocolate Belga Trufado 70%',
  'Gourmet',
  15.00,
  NULL,
  'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
  'Massa densa e molhada de chocolate nobre, recheio cremoso de ganache artesanal belga 70% cacau e granulado de chocolate belga raspado à mão.',
  'Chocolate belga 70%, Creme de leite fresco, Farinha de trigo orgânica, Cacau Callebaut, Açúcar mascavo',
  12,
  380,
  5.00
),
(
  'cup-03',
  'Frutas Vermelhas & Pistache',
  'Gourmet',
  16.50,
  NULL,
  'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80',
  'Base aromática de pistache da Sicília com coulis de framboesa fresca, finalizado com buttercream aveludado e pistaches tostados crocantes.',
  'Pistache siciliano triturado, Geleia de framboesa e amoras, Farinha de trigo, Manteiga, Ovos',
  8,
  340,
  4.80
),
(
  'cup-04',
  'Vegano Flor de Laranja & Mirtilo',
  'Vegano',
  15.50,
  NULL,
  'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
  'Totalmente livre de ingredientes de origem animal. Massa leve e úmida infusionada com água de flor de laranjeira, mirtilos frescos e creme de coco batido.',
  'Farinha de aveia sem glúten, Leite de amêndoas, Mirtilos orgânicos, Água de flor de laranjeira, Creme de coco orgânico, Óleo de coco',
  14,
  260,
  4.90
),
(
  'cup-05',
  'Vegano Cacau Supremo & Amêndoas',
  'Vegano',
  14.90,
  13.50,
  'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
  'Massa fofa 100% vegana de cacau alcalino enriquecida com lâminas de amêndoas tostadas e ganache feito à base de chocolate amargo e leite de castanhas.',
  'Farinha de espelta, Cacau 100%, Açúcar demerara, Leite de castanha de caju, Lâminas de amêndoa',
  10,
  290,
  4.70
),
(
  'cup-06',
  'Zero Açúcar Ninho & Morango',
  'Zero Açúcar',
  16.00,
  NULL,
  'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  'Adoçado naturalmente com xilitol e estévia pura de alta pureza. Massa de baunilha fofa, recheio de morangos in natura e creme suave sem açúcar adicionado.',
  'Farinha de trigo enriquecida, Xilitol premium, Estévia, Morangos frescos, Leite em pó desnatado, Ovos',
  9,
  195,
  4.80
),
(
  'cup-07',
  'Zero Açúcar Doce de Leite Artesanal',
  'Zero Açúcar',
  15.50,
  NULL,
  'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
  'Massa leve com toque de canela do Ceilão, recheada com doce de leite caseiro sem adição de açúcares refinados, coberto com raspas de canela.',
  'Farinha de aveia, Leite integral sem lactose, Eritritol e taumatina, Canela em pó, Ovos orgânicos',
  0,
  210,
  4.60
),
(
  'cup-08',
  'Natalino Especiarias & Nozes Douradas',
  'Sazonais',
  17.50,
  15.00,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'Edição Especial de Fim de Ano: Massa aromatizada com noz-moscada, canela e raspas de laranja, com recheio de nozes nobres e cobertura decorada de neve.',
  'Farinha especial, Nozes chilenas selecionadas, Mix de especiarias natalinas, Mel silvestre, Glacê real',
  15,
  360,
  5.00
),
(
  'cup-09',
  'Sazonal Páscoa Ninho & Cenoura Trufada',
  'Sazonais',
  16.90,
  NULL,
  'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
  'Tradicional massa fofinha de bolo de cenoura caseiro, afogada com vulcão de brigadeiro gourmet cremoso e raspas de chocolate ao leite.',
  'Cenouras frescas selecionadas, Farinha de trigo, Óleo vegetal puro, Cacau 50%, Leite condensado moça',
  11,
  350,
  4.90
);

-- 4.4 Associação N:M entre Cupcakes e Alérgenos
INSERT INTO cupcake_allergens (cupcake_id, allergen_id) VALUES
-- Red Velvet (Glúten, Lactose, Ovos)
('cup-01', 'alg-01'),
('cup-01', 'alg-02'),
('cup-01', 'alg-03'),
-- Chocolate Belga (Glúten, Lactose, Ovos)
('cup-02', 'alg-01'),
('cup-02', 'alg-02'),
('cup-02', 'alg-03'),
-- Frutas Vermelhas & Pistache (Glúten, Lactose, Ovos, Nozes)
('cup-03', 'alg-01'),
('cup-03', 'alg-02'),
('cup-03', 'alg-03'),
('cup-03', 'alg-04'),
-- Vegano Flor de Laranja (Nozes)
('cup-04', 'alg-04'),
-- Vegano Cacau Supremo (Glúten, Nozes)
('cup-05', 'alg-01'),
('cup-05', 'alg-04'),
-- Zero Açúcar Ninho (Glúten, Lactose, Ovos)
('cup-06', 'alg-01'),
('cup-06', 'alg-02'),
('cup-06', 'alg-03'),
-- Zero Açúcar Doce de Leite (Lactose, Ovos)
('cup-07', 'alg-02'),
('cup-07', 'alg-03'),
-- Natalino Especiarias (Glúten, Lactose, Ovos, Nozes)
('cup-08', 'alg-01'),
('cup-08', 'alg-02'),
('cup-08', 'alg-03'),
('cup-08', 'alg-04'),
-- Páscoa Cenoura Trufada (Glúten, Lactose, Ovos)
('cup-09', 'alg-01'),
('cup-09', 'alg-02'),
('cup-09', 'alg-03');

-- 4.5 Inserção de Pedido Exemplo (Demonstração e Validação Referencial)
INSERT INTO orders (
  id, user_id, customer_name, customer_phone, customer_email,
  status, payment_method, payment_status, subtotal, delivery_fee, discount, total,
  coupon_code, is_pickup, street, number, complement, neighborhood, city, state, cep,
  estimated_minutes, rating, rating_feedback
) VALUES (
  'PED-592814',
  'usr-demo-1',
  'Maria Silva',
  '(11) 98765-4321',
  'cliente@sweetbliss.com',
  'Entregue',
  'PIX',
  'Aprovado',
  27.90,
  7.90,
  0.00,
  35.80,
  NULL,
  FALSE,
  'Avenida Paulista',
  '1000',
  'Apto 42',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  35,
  5,
  'Maravilhosos! Chegaram perfeitos na embalagem térmica e super fresquinhos.'
);

INSERT INTO order_items (order_id, cupcake_id, quantity, unit_price, total_price) VALUES
('PED-592814', 'cup-01', 1, 12.90, 12.90),
('PED-592814', 'cup-02', 1, 15.00, 15.00);

-- ==============================================================================
-- FIM DO SCRIPT DE CRIAÇÃO E CARGA DO BANCO DE DADOS
-- ==============================================================================
