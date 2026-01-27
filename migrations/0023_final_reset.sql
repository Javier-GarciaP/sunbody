-- Final Reset Script
-- Deletes all transactional data, customers and products 
-- KEEPS Colors and Exchange Rate

-- 1. Sales and Payments
DELETE FROM payments;
DELETE FROM sale_items;
DELETE FROM sales;

-- 2. Orders
DELETE FROM order_items;
DELETE FROM orders;

-- 3. Inventory and Packages
DELETE FROM package_items;
DELETE FROM packages;

-- 4. Catalog (Products)
DELETE FROM product_variants;
DELETE FROM products_base;
DELETE FROM products; -- Clearing legacy product table if exists

-- 5. Customers
DELETE FROM customers;

-- 6. Reset Sequences for all cleared tables
DELETE FROM sqlite_sequence WHERE name IN (
  'payments', 'sale_items', 'sales', 
  'order_items', 'orders', 
  'package_items', 'packages', 
  'product_variants', 'products_base', 'products',
  'customers'
);

-- Vacuum to optimize
-- VACUUM;
