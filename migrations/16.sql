-- Create returns table for audit trial and financial tracking
CREATE TABLE returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    color_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_cop INTEGER NOT NULL, -- The price at the time of sale
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products_base(id),
    FOREIGN KEY (color_id) REFERENCES colors(id)
);

CREATE INDEX idx_returns_sale ON returns(sale_id);
