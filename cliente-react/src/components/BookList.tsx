/**
 * COMPONENTE BOOK LIST - CLIENTE REACT
 *
 * Demuestra cómo el CLIENTE consume datos del SERVIDOR
 * a través de la API REST
 */

import React, { useState, useEffect } from 'react'
import { Book, BookFilters } from '../types/api'
import { booksApi } from '../services/api'

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<BookFilters>({})

    // Función para cargar libros desde el servidor
    const loadBooks = async (currentFilters: BookFilters = {}) => {
        setLoading(true)
        setError(null)

        try {
            // ⭐ AQUÍ ES DONDE OCURRE LA COMUNICACIÓN CLIENTE-SERVIDOR
            // El cliente (React) hace una petición HTTP al servidor (Node.js API)
            const fetchedBooks = await booksApi.searchBooks(currentFilters)
            setBooks(fetchedBooks)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Error cargando libros',
            )
            console.error('Error loading books:', err)
        } finally {
            setLoading(false)
        }
    }

    // Cargar libros al montar el componente
    useEffect(() => {
        loadBooks()
    }, [])

    // Manejar cambios en filtros
    const handleFilterChange = (
        key: keyof BookFilters,
        value: string | boolean,
    ) => {
        const newFilters = { ...filters }

        if (value === '' || value === undefined) {
            delete newFilters[key]
        } else {
            newFilters[key] = value as any
        }

        setFilters(newFilters)
    }

    // Aplicar filtros
    const applyFilters = () => {
        loadBooks(filters)
    }

    // Limpiar filtros
    const clearFilters = () => {
        setFilters({})
        loadBooks({})
    }

    return (
        <div className="card">
            <div className="mb-4">
                <h2 className="text-lg font-bold mb-4">
                    📚 Catálogo de Libros
                </h2>

                {/* Filtros de búsqueda */}
                <div className="grid grid-2 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por título..."
                        className="input"
                        value={filters.title || ''}
                        onChange={e =>
                            handleFilterChange('title', e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Buscar por autor..."
                        className="input"
                        value={filters.author || ''}
                        onChange={e =>
                            handleFilterChange('author', e.target.value)
                        }
                    />

                    <select
                        className="input"
                        value={filters.category || ''}
                        onChange={e =>
                            handleFilterChange('category', e.target.value)
                        }
                    >
                        <option value="">Todas las categorías</option>
                        <option value="Programming">Programming</option>
                        <option value="Software Engineering">
                            Software Engineering
                        </option>
                        <option value="Architecture">Architecture</option>
                    </select>

                    <select
                        className="input"
                        value={
                            filters.isAvailable === undefined
                                ? ''
                                : filters.isAvailable.toString()
                        }
                        onChange={e => {
                            const value = e.target.value
                            handleFilterChange(
                                'isAvailable',
                                value === '' ? undefined : value === 'true',
                            )
                        }}
                    >
                        <option value="">Todos los libros</option>
                        <option value="true">Solo disponibles</option>
                        <option value="false">No disponibles</option>
                    </select>
                </div>

                {/* Botones de acción */}
                <div className="mb-4">
                    <button
                        className="button button-primary mr-2"
                        onClick={applyFilters}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading"></span>
                        ) : (
                            '🔍 Buscar'
                        )}
                    </button>

                    <button
                        className="button button-secondary"
                        onClick={clearFilters}
                        disabled={loading}
                    >
                        🗑️ Limpiar
                    </button>
                </div>
            </div>

            {/* Estado de carga */}
            {loading && (
                <div className="text-center mb-4">
                    <span className="loading"></span>
                    <span className="ml-2">
                        Cargando libros desde el servidor...
                    </span>
                </div>
            )}

            {/* Manejo de errores */}
            {error && (
                <div
                    className="mb-4 p-3"
                    style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            {/* Lista de libros */}
            {!loading && !error && (
                <>
                    <div className="mb-4 text-sm">
                        📊 {books.length} libro{books.length !== 1 ? 's' : ''}{' '}
                        encontrado{books.length !== 1 ? 's' : ''}
                    </div>

                    <div className="grid grid-2">
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>

                    {books.length === 0 && (
                        <div
                            className="text-center p-8"
                            style={{ color: '#6b7280' }}
                        >
                            📭 No se encontraron libros con los filtros
                            aplicados
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/**
 * Componente individual para mostrar un libro
 */
const BookCard: React.FC<{ book: Book }> = ({ book }) => {
    return (
        <div
            className="card"
            style={{ margin: '0', border: '1px solid #e5e7eb' }}
        >
            <div className="mb-2">
                <h3 className="font-bold">{book.title}</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                    por {book.author}
                </p>
            </div>

            <div className="mb-2">
                <span className="badge badge-secondary">{book.category}</span>
                <span className="ml-2 text-sm">📅 {book.publishedYear}</span>
            </div>

            <div className="mb-2 text-sm">
                <div>📋 ISBN: {book.isbn}</div>
                <div>
                    📚 Copias: {book.availableCopies}/{book.totalCopies}
                </div>
                <div>📊 Disponibilidad: {book.availabilityPercentage}%</div>
            </div>

            <div className="flex justify-between align-items-center">
                <div>
                    {book.isAvailable && (
                        <span className="badge badge-success">
                            ✅ Disponible
                        </span>
                    )}
                    {!book.isAvailable && (
                        <span className="badge badge-error">
                            ❌ No disponible
                        </span>
                    )}
                    {book.isPopular && (
                        <span className="badge badge-warning ml-1">
                            🔥 Popular
                        </span>
                    )}
                    {book.isRecent && (
                        <span className="badge badge-info ml-1">
                            🆕 Reciente
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookList
