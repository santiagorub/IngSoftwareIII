-- Schema and seed for practica-patrones-1 example (coffee store)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    total NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_fee NUMERIC(10,2),
    payment_discount NUMERIC(10,2),
    shipping_street TEXT,
    shipping_city TEXT,
    shipping_zip TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    line_total NUMERIC(10,2) NOT NULL
);

-- Seed basic data
INSERT INTO users (id, name, email) VALUES
    ('u1', 'Ana', 'ana@example.com'),
    ('u2', 'Luis', 'luis@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, price) VALUES
    ('p1', 'Café en grano 1kg', 20.00),
    ('p2', 'Filtro papel x100', 6.00),
    ('p3', 'Molinillo manual', 35.00)
ON CONFLICT (id) DO NOTHING;


