
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  total_cop INTEGER NOT NULL,
  paid_cop INTEGER NOT NULL DEFAULT 0,
  paid_ves REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL,
  is_credit BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  color_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price_cop INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_credit ON sales(is_credit);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
