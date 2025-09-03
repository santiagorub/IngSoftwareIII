/**
 * COMPONENTE SERVER STATUS - CLIENTE REACT
 *
 * Demuestra el monitoreo del estado de la comunicación Cliente-Servidor
 */

import React, { useState, useEffect } from 'react'
import { healthApi } from '../services/api'

const ServerStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null)
    const [serverInfo, setServerInfo] = useState<{
        message: string
        timestamp: string
        version: string
    } | null>(null)
    const [lastCheck, setLastCheck] = useState<Date | null>(null)

    const checkServerStatus = async (retryCount = 0) => {
        try {
            // ⭐ VERIFICAR COMUNICACIÓN CLIENTE-SERVIDOR
            const health = await healthApi.checkHealth()
            setIsOnline(true)
            setServerInfo(health)
            setLastCheck(new Date())
            console.log('✅ Server connection successful:', health)
        } catch (error) {
            console.error('❌ Server health check failed:', error)

            // Intentar reconectar hasta 2 veces con delay
            if (retryCount < 2) {
                console.log(
                    `🔄 Retrying connection (attempt ${retryCount + 1}/2)...`,
                )
                setTimeout(() => {
                    checkServerStatus(retryCount + 1)
                }, 1000 * (retryCount + 1)) // 1s, 2s delay
                return
            }

            setIsOnline(false)
            setServerInfo(null)
            setLastCheck(new Date())
        }
    }

    // Verificar estado del servidor cada 30 segundos
    useEffect(() => {
        checkServerStatus() // Verificar inmediatamente

        const interval = setInterval(checkServerStatus, 30000) // Cada 30 segundos

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = () => {
        if (isOnline === null) return '#6b7280' // Gris para "checking"
        return isOnline ? '#10b981' : '#ef4444' // Verde para online, rojo para offline
    }

    const getStatusText = () => {
        if (isOnline === null) return 'Verificando...'
        return isOnline ? 'Servidor Online' : 'Servidor Offline'
    }

    const getStatusIcon = () => {
        if (isOnline === null) return '🔄'
        return isOnline ? '✅' : '❌'
    }

    return (
        <div
            className="card"
            style={{
                borderColor: getStatusColor(),
                borderWidth: '2px',
                marginBottom: '20px',
            }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold mb-1">
                        {getStatusIcon()} Estado del Servidor
                    </h3>
                    <p
                        className="text-sm font-semibold"
                        style={{ color: getStatusColor() }}
                    >
                        {getStatusText()}
                    </p>
                    {lastCheck && (
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                            Última verificación:{' '}
                            {lastCheck.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        className="button button-secondary"
                        onClick={() => checkServerStatus()}
                        disabled={isOnline === null}
                    >
                        🔄 Verificar
                    </button>
                    <button
                        className="button button-primary"
                        onClick={() =>
                            window.open(
                                'http://localhost:3000/api/health',
                                '_blank',
                            )
                        }
                        style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontSize: '12px',
                            padding: '4px 8px',
                        }}
                    >
                        🔗 Test Directo
                    </button>
                </div>
            </div>

            {/* Información del servidor cuando está online */}
            {isOnline && serverInfo && (
                <div
                    className="mt-4 p-3"
                    style={{ backgroundColor: '#f0f9f4', borderRadius: '6px' }}
                >
                    <div className="text-sm">
                        <div>
                            <strong>Mensaje:</strong> {serverInfo.message}
                        </div>
                        <div>
                            <strong>Versión:</strong> {serverInfo.version}
                        </div>
                        <div>
                            <strong>Servidor iniciado:</strong>{' '}
                            {new Date(serverInfo.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje de error cuando está offline */}
            {isOnline === false && (
                <div
                    className="mt-4 p-3"
                    style={{ backgroundColor: '#fef2f2', borderRadius: '6px' }}
                >
                    <div className="text-sm" style={{ color: '#dc2626' }}>
                        <strong>❌ No se puede conectar al servidor</strong>
                        <br />
                        <br />
                        <strong>Pasos para solucionar:</strong>
                        <br />
                        1. Verifica que el servidor esté ejecutándose en
                        http://localhost:3000
                        <br />
                        2. Abre las Herramientas de Desarrollador (F12) y ve a
                        la pestaña "Console" para ver errores detallados
                        <br />
                        3. Abre la pestaña "Network" y recarga la página para
                        ver las peticiones fallidas
                        <br />
                        4. Intenta hacer una petición directa:{' '}
                        <a
                            href="http://localhost:3000/api/health"
                            target="_blank"
                            rel="noopener"
                            style={{
                                color: '#2563eb',
                                textDecoration: 'underline',
                            }}
                        >
                            http://localhost:3000/api/health
                        </a>
                        <br />
                        5. Si el problema persiste, reinicia el servidor React
                        (Ctrl+C y luego npm run dev)
                    </div>
                </div>
            )}

            {/* Información educativa */}
            <div
                className="mt-4 p-3"
                style={{ backgroundColor: '#f8fafc', borderRadius: '6px' }}
            >
                <h4 className="font-bold text-sm mb-2">
                    💡 Arquitectura Cliente-Servidor
                </h4>
                <div className="text-xs" style={{ color: '#6b7280' }}>
                    <p>
                        <strong>Cliente (React):</strong> http://localhost:5173
                        (este navegador)
                    </p>
                    <p>
                        <strong>Servidor (Node.js API):</strong>{' '}
                        http://localhost:3000
                    </p>
                    <p>
                        <strong>Comunicación:</strong> HTTP/REST a través de la
                        red
                    </p>
                    <p>
                        <strong>Separación:</strong> Frontend y Backend
                        ejecutándose independientemente
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ServerStatus
