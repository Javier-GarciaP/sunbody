PRAGMA foreign_keys=OFF;
CREATE TABLE orders_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER, -- Removed NOT NULL
    status TEXT CHECK(status IN ('Pendiente', 'Completado', 'Cancelado')) DEFAULT 'Pendiente',
    note TEXT,
    prepayment_cop INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
INSERT INTO orders_new (id, customer_id, status, note, prepayment_cop, created_at, updated_at)
SELECT id, customer_id, status, note, prepayment_cop, created_at, updated_at FROM orders;
DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;
PRAGMA foreign_keys=ON;
