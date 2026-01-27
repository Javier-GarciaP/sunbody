-- Add returned_quantity to sale_items for better tracking
ALTER TABLE sale_items ADD COLUMN returned_quantity INTEGER DEFAULT 0;
