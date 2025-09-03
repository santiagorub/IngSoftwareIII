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
  queueLimit: 0
};

// Pool de conexiones global
let connectionPool: mysql.Pool | null = null;

/**
 * Inicializa el pool de conexiones
 */
export function initializeDatabase(config: DatabaseConfig = defaultConfig): mysql.Pool {
  if (connectionPool) {
    return connectionPool;
  }

  connectionPool = mysql.createPool(config);
  
  console.log('📊 Database pool created:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user
  });

  return connectionPool;
}

/**
 * Obtiene el pool de conexiones
 */
export function getDatabase(): mysql.Pool {
  if (!connectionPool) {
    connectionPool = initializeDatabase();
  }
  return connectionPool;
}

/**
 * Cierra todas las conexiones (para testing o shutdown)
 */
export async function closeDatabase(): Promise<void> {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
    console.log('📊 Database connections closed');
  }
}

/**
 * Verifica la conexión a la base de datos
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
