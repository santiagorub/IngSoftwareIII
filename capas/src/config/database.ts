/**
 * CONFIGURACIÓN DE BASE DE DATOS
 *
 * Centraliza la configuración de conexión a MySQL
 */

import mysql from 'mysql2/promise';

export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
}

// Configuración por defecto (desarrollo con Docker)
export const defaultConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'biblioteca_user',
    password: process.env.DB_PASSWORD || 'biblioteca_pass',
    database: process.env.DB_NAME || 'biblioteca_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Implementación estricta de Singleton para el pool de conexiones
export class Database {
    private static instance: Database | null = null;
    private pool: mysql.Pool;

    private constructor(config: DatabaseConfig) {
        this.pool = mysql.createPool(config);
        console.log('📊 Database pool created:', {
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
        });
    }

    static getInstance(config: DatabaseConfig = defaultConfig): Database {
        if (!Database.instance) {
            Database.instance = new Database(config);
        }
        return Database.instance;
    }

    static hasInstance(): boolean {
        return Database.instance !== null;
    }

    getPool(): mysql.Pool {
        return this.pool;
    }

    async close(): Promise<void> {
        await this.pool.end();
        Database.instance = null;
        console.log('📊 Database connections closed');
    }

    async testConnection(): Promise<boolean> {
        const connection = await this.pool.getConnection();
        try {
            await connection.ping();
            return true;
        } finally {
            connection.release();
        }
    }
}

/**
 * Inicializa el pool de conexiones
 */
export function initializeDatabase(config: DatabaseConfig = defaultConfig): mysql.Pool {
    return Database.getInstance(config).getPool();
}

/**
 * Obtiene el pool de conexiones
 */
export function getDatabase(): mysql.Pool {
    return Database.getInstance().getPool();
}

/**
 * Cierra todas las conexiones (para testing o shutdown)
 */
export async function closeDatabase(): Promise<void> {
    if (Database.hasInstance()) {
        await Database.getInstance().close();
    }
}

/**
 * Verifica la conexión a la base de datos
 */
export async function testConnection(): Promise<boolean> {
    try {
        const ok = await Database.getInstance().testConnection();
        console.log('✅ Database connection successful');
        return ok;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
