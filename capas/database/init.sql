-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente cuando se crea el contenedor

USE biblioteca_db;

-- Tabla de libros
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(45) PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    published_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_category (category),
    INDEX idx_available (available_copies)
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(45) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    user_type ENUM('STUDENT', 'PROFESSOR', 'LIBRARIAN') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_loans INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_active (is_active)
);


-- Insertar datos de ejemplo

-- Libros de ejemplo
INSERT INTO books (id, isbn, title, author, category, total_copies, available_copies, published_year) VALUES
('550e8400-e29b-41d4-a716-446655440001', '978-0134685991', 'Effective Java', 'Joshua Bloch', 'Programming', 5, 3, 2017),
('550e8400-e29b-41d4-a716-446655440002', '978-0596007126', 'Head First Design Patterns', 'Eric Freeman', 'Software Engineering', 4, 1, 2004),
('550e8400-e29b-41d4-a716-446655440003', '978-0132350884', 'Clean Code', 'Robert C. Martin', 'Software Engineering', 6, 4, 2008),
('550e8400-e29b-41d4-a716-446655440004', '978-0201633610', 'Design Patterns', 'Gang of Four', 'Software Engineering', 3, 2, 1994),
('550e8400-e29b-41d4-a716-446655440005', '978-0321127426', 'Patterns of Enterprise Application Architecture', 'Martin Fowler', 'Architecture', 2, 1, 2002);

-- Usuarios de ejemplo
INSERT INTO users (id, email, name, user_type, is_active, current_loans) VALUES
('user-550e8400-e29b-41d4-a716-446655440001', 'juan.perez@universidad.edu', 'Juan Pérez', 'STUDENT', TRUE, 2),
('user-550e8400-e29b-41d4-a716-446655440002', 'maria.garcia@universidad.edu', 'María García', 'PROFESSOR', TRUE, 5),
('user-550e8400-e29b-41d4-a716-446655440003', 'ana.martinez@biblioteca.edu', 'Ana Martínez', 'LIBRARIAN', TRUE, 0),
('user-550e8400-e29b-41d4-a716-446655440004', 'carlos.rodriguez@universidad.edu', 'Carlos Rodríguez', 'STUDENT', TRUE, 1),
('user-550e8400-e29b-41d4-a716-446655440005', 'sofia.lopez@universidad.edu', 'Sofía López', 'PROFESSOR', TRUE, 3);


-- Mostrar resumen de datos insertados
SELECT 'Books inserted:' as info, COUNT(*) as count FROM books
UNION ALL
SELECT 'Users inserted:' as info, COUNT(*) as count FROM users;
