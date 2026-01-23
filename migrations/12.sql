-- Migration to add package_id to sale_items
ALTER TABLE sale_items ADD COLUMN package_id INTEGER;
CREATE INDEX idx_sale_items_package ON sale_items(package_id);
