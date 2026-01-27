-- Migration 10: Seed database with colors, products, and packages
-- This migration populates the database with initial data

-- Clear existing data
DELETE FROM package_items;
DELETE FROM packages;
DELETE FROM product_variants;
DELETE FROM products_base;
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM payments;
DELETE FROM customers;
DELETE FROM products;
DELETE FROM colors;
DELETE FROM exchange_rate;

-- Reset autoincrement sequences
DELETE FROM sqlite_sequence WHERE name IN (
  'package_items', 'packages', 'product_variants', 'products_base', 
  'sale_items', 'sales', 'payments', 'customers', 'products', 'colors', 'exchange_rate'
);

-- Re-insert exchange rate (default)
INSERT INTO exchange_rate (cop_to_ves) VALUES (7);

-- Insert Colors (23 colors including 3 brown tones)
INSERT INTO colors (name, hex_code) VALUES
  ('Negro', '#000000'),
  ('Blanco', '#FFFFFF'),
  ('Gris', '#808080'),
  ('Rojo', '#FF0000'),
  ('Azul', '#0000FF'),
  ('Verde', '#008000'),
  ('Amarillo', '#FFFF00'),
  ('Naranja', '#FFA500'),
  ('Rosa', '#FFC0CB'),
  ('Morado', '#800080'),
  ('Beige', '#F5F5DC'),
  ('Turquesa', '#40E0D0'),
  ('Verde Oliva', '#808000'),
  ('Azul Marino', '#000080'),
  ('Fucsia', '#FF00FF'),
  ('Verde Menta', '#98FF98'),
  ('Coral', '#FF7F50'),
  ('Lavanda', '#E6E6FA'),
  ('Durazno', '#FFDAB9'),
  ('Celeste', '#87CEEB'),
  ('Marrón Claro', '#D2B48C'),
  ('Marrón', '#8B4513'),
  ('Marrón Oscuro', '#654321');

-- Insert Products Base (8 products with their prices)
INSERT INTO products_base (name, price_cop) VALUES
  ('Mono Baggy', 38000),
  ('Body manga larga (Cuello cuadrado)', 38000),
  ('Body manga larga (Cuello redondo)', 38000),
  ('Body manga corta (Cuello cuadrado)', 36000),
  ('Body manga corta (Cuello redondo)', 36000),
  ('Body Halter', 34000),
  ('Body corte princesa', 34000),
  ('Body Asimétrico', 32000);

-- Insert Product Variants (creating variants for the first 5 colors for each product)
-- Mono Baggy variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (1, 1, 10), (1, 2, 8), (1, 3, 12), (1, 4, 6), (1, 5, 9);

-- Body manga larga (Cuello cuadrado) variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (2, 1, 15), (2, 2, 10), (2, 3, 8), (2, 4, 12), (2, 5, 7);

-- Body manga larga (Cuello redondo) variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (3, 1, 11), (3, 2, 9), (3, 3, 14), (3, 4, 8), (3, 5, 10);

-- Body manga corta (Cuello cuadrado) variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (4, 1, 13), (4, 2, 11), (4, 3, 7), (4, 4, 9), (4, 5, 12);

-- Body manga corta (Cuello redondo) variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (5, 1, 9), (5, 2, 14), (5, 3, 10), (5, 4, 11), (5, 5, 8);

-- Body Halter variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (6, 1, 12), (6, 2, 8), (6, 3, 9), (6, 4, 13), (6, 5, 10);

-- Body corte princesa variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (7, 1, 10), (7, 2, 12), (7, 3, 11), (7, 4, 7), (7, 5, 9);

-- Body Asimétrico variants
INSERT INTO product_variants (product_id, color_id, stock) VALUES
  (8, 1, 14), (8, 2, 9), (8, 3, 8), (8, 4, 10), (8, 5, 11);

-- Insert Packages (4 packages in "Armado" status)
INSERT INTO packages (name, status) VALUES
  ('Paquete Básico', 'Armado'),
  ('Paquete Premium', 'Armado'),
  ('Paquete Variado', 'Armado'),
  ('Paquete Especial', 'Armado');

-- Insert Package Items for Paquete Básico (package_id = 1)
-- 2x Mono Baggy Negro, 3x Body manga corta (cuello cuadrado) Blanco, 2x Body Halter Azul
INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES
  (1, 1, 1, 2),  -- Mono Baggy Negro x2
  (1, 4, 2, 3),  -- Body manga corta (Cuello cuadrado) Blanco x3
  (1, 6, 5, 2);  -- Body Halter Azul x2

-- Insert Package Items for Paquete Premium (package_id = 2)
-- 3x Body manga larga (cuadrado) Negro, 3x Body manga larga (redondo) Rojo, 4x Body corte princesa Rosa
INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES
  (2, 2, 1, 3),  -- Body manga larga (Cuello cuadrado) Negro x3
  (2, 3, 4, 3),  -- Body manga larga (Cuello redondo) Rojo x3
  (2, 7, 9, 4);  -- Body corte princesa Rosa x4

-- Insert Package Items for Paquete Variado (package_id = 3)
-- 2x Mono Baggy Gris, 2x Body manga corta (redondo) Blanco, 3x Body Asimétrico Morado, 2x Body Halter Negro
INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES
  (3, 1, 3, 2),  -- Mono Baggy Gris x2
  (3, 5, 2, 2),  -- Body manga corta (Cuello redondo) Blanco x2
  (3, 8, 10, 3), -- Body Asimétrico Morado x3
  (3, 6, 1, 2);  -- Body Halter Negro x2

-- Insert Package Items for Paquete Especial (package_id = 4)
-- 2x Body manga larga (cuadrado) Marrón Claro, 3x Body manga corta (cuadrado) Marrón, 
-- 2x Body corte princesa Marrón Oscuro, 2x Mono Baggy Azul
INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES
  (4, 2, 21, 2), -- Body manga larga (Cuello cuadrado) Marrón Claro x2
  (4, 4, 22, 3), -- Body manga corta (Cuello cuadrado) Marrón x3
  (4, 7, 23, 2), -- Body corte princesa Marrón Oscuro x2
  (4, 1, 5, 2);  -- Mono Baggy Azul x2
