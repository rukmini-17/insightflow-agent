DROP TABLE IF EXISTS sales;

CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    category TEXT,
    product TEXT,
    region TEXT,
    quantity INTEGER,
    unit_price REAL,
    total_sales REAL
);

-- Index for faster querying
CREATE INDEX idx_date ON sales(date);
CREATE INDEX idx_product ON sales(product);