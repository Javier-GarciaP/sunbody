-- Update orders for prepayment and item purchase status
ALTER TABLE orders ADD COLUMN prepayment_cop INTEGER DEFAULT 0;
ALTER TABLE order_items ADD COLUMN is_purchased BOOLEAN DEFAULT FALSE;
ALTER TABLE order_items ADD COLUMN package_id INTEGER REFERENCES packages(id);
