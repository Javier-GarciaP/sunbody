
DROP INDEX idx_product_variants_color;
DROP INDEX idx_product_variants_product;
DROP INDEX idx_products_base_name;
DROP TABLE product_variants;
DROP TABLE products_base;
ALTER TABLE products DROP COLUMN is_legacy;
