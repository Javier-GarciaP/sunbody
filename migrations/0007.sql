
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  amount_cop INTEGER NOT NULL DEFAULT 0,
  amount_ves REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_customer ON payments(customer_id);
