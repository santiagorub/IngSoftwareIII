/**
 * APLICACIÓN PRINCIPAL - CLIENTE REACT
 *
 * Este es el CLIENTE en la arquitectura Cliente-Servidor.
 * Demuestra:
 * - Separación física del servidor (diferente puerto, tecnología)
 * - Comunicación a través de HTTP/REST
 * - UI reactiva que consume datos del servidor
 */

import React from 'react'
import BookList from './components/BookList'
import ServerStatus from './components/ServerStatus'

const App: React.FC = () => {
    return (
        <div className="container">
            <div className="card mb-4">
                <h1 className="text-2xl font-bold text-center mb-2">
                    📚 Biblioteca - Cliente React
                </h1>
                <p className="text-center text-sm" style={{ color: '#6b7280' }}>
                    Cliente-Servidor + REST + Capas (versión simplificada)
                </p>
            </div>

            <ServerStatus />
            <BookList />
            <ArchitectureInfo />
        </div>
    )
}

/**
 * Componente que explica la arquitectura del sistema
 */
const ArchitectureInfo: React.FC = () => {
    return (
        <div>
            <div className="card mb-4">
                <h2 className="font-bold text-lg mb-4">
                    🏗️ Arquitectura del Sistema
                </h2>
                <p className="mb-4">
                    Este proyecto demuestra múltiples conceptos arquitectónicos
                    trabajando juntos:
                </p>
            </div>

            {/* Cliente-Servidor */}
            <div className="card mb-4">
                <h3 className="font-bold mb-3">
                    🌐 Arquitectura Cliente-Servidor
                </h3>
                <div className="grid grid-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-bold text-blue-800">
                            📱 CLIENTE (Frontend)
                        </h4>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                            <li>• React + TypeScript + Vite</li>
                            <li>• Puerto 5173</li>
                            <li>• Interfaz de usuario</li>
                            <li>• Consume APIs REST</li>
                            <li>• Estado local (React hooks)</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-bold text-green-800">
                            🖥️ SERVIDOR (Backend)
                        </h4>
                        <ul className="text-sm text-green-700 mt-2 space-y-1">
                            <li>• Node.js + Express + TypeScript</li>
                            <li>• Puerto 3000</li>
                            <li>• API REST</li>
                            <li>• Lógica de negocio</li>
                            <li>• Base de datos MySQL</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm text-center">
                        <strong>Comunicación:</strong> HTTP/HTTPS •{' '}
                        <strong>Formato:</strong> JSON •{' '}
                        <strong>Estilo:</strong> REST
                    </p>
                </div>
            </div>

            {/* Arquitectura en Capas (Servidor) */}
            <div className="card mb-4">
                <h3 className="font-bold mb-3">
                    🏗️ Arquitectura en Capas (Servidor)
                </h3>
                <div className="space-y-3">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <h4 className="font-bold text-purple-800">
                            📱 CAPA DE PRESENTACIÓN
                        </h4>
                        <p className="text-sm text-purple-700">
                            Controllers, DTOs, Routes, Mappers
                        </p>
                        <p className="text-xs text-purple-600">
                            Responsabilidad: HTTP, validación, formato de
                            respuestas
                        </p>
                    </div>
                    <div className="text-center text-purple-600">↕️</div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <h4 className="font-bold text-orange-800">
                            💼 CAPA DE LÓGICA DE NEGOCIO
                        </h4>
                        <p className="text-sm text-orange-700">
                            Services, Entities, Business Rules
                        </p>
                        <p className="text-xs text-orange-600">
                            Responsabilidad: Reglas de negocio, orquestación,
                            validaciones complejas
                        </p>
                    </div>
                    <div className="text-center text-orange-600">↕️</div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-bold text-green-800">
                            💾 CAPA DE ACCESO A DATOS
                        </h4>
                        <p className="text-sm text-green-700">
                            Repositories, Data Models, Database
                        </p>
                        <p className="text-xs text-green-600">
                            Responsabilidad: Persistencia, consultas,
                            almacenamiento
                        </p>
                    </div>
                </div>
            </div>

            {/* REST */}
            <div className="card mb-4">
                <h3 className="font-bold mb-3">🔄 API REST</h3>
                <div className="grid grid-2 gap-4">
                    <div>
                        <h4 className="font-bold mb-2">📋 Recursos</h4>
                        <ul className="text-sm space-y-1">
                            <li>
                                • <code>/api/books</code> - Libros
                            </li>
                            <li>
                                • <code>/api/users</code> - Usuarios
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">🔧 Verbos HTTP</h4>
                        <ul className="text-sm space-y-1">
                            <li>
                                • <code>GET</code> - Obtener datos
                            </li>
                            <li>
                                • <code>POST</code> - Crear recursos
                            </li>
                            <li>
                                • <code>PUT</code> - Actualizar completo
                            </li>
                            <li>
                                • <code>PATCH</code> - Actualizar parcial
                            </li>
                            <li>
                                • <code>DELETE</code> - Eliminar
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Patrones de Diseño */}
            <div className="card mb-4">
                <h3 className="font-bold mb-3">
                    🔧 Patrones de Diseño Utilizados
                </h3>
                <div className="grid grid-2 gap-4">
                    <div>
                        <ul className="text-sm space-y-1">
                            <li>
                                • <strong>MVC:</strong> En la capa de
                                presentación
                            </li>
                            <li>
                                • <strong>Repository:</strong> Para acceso a
                                datos
                            </li>
                            <li>
                                • <strong>Service Layer:</strong> Para lógica de
                                negocio
                            </li>
                        </ul>
                    </div>
                    <div>
                        <ul className="text-sm space-y-1">
                            <li>
                                • <strong>DTO:</strong> Para transferencia de
                                datos
                            </li>
                            <li>
                                • <strong>Dependency Injection:</strong> En
                                configuración
                            </li>
                            <li>
                                • <strong>Factory:</strong> Para repositorios
                                MySQL vs Memory
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Ventajas */}
            <div className="card">
                <h3 className="font-bold mb-3">
                    ✅ Ventajas de esta Arquitectura
                </h3>
                <div className="grid grid-2 gap-4">
                    <div>
                        <h4 className="font-bold mb-2">Cliente-Servidor</h4>
                        <ul className="text-sm space-y-1">
                            <li>• Separación de responsabilidades</li>
                            <li>• Escalabilidad independiente</li>
                            <li>• Múltiples clientes (web, móvil)</li>
                            <li>• Tecnologías especializadas</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Capas</h4>
                        <ul className="text-sm space-y-1">
                            <li>• Mantenibilidad</li>
                            <li>• Testabilidad</li>
                            <li>• Trabajo en equipo</li>
                            <li>• Reutilización de código</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
