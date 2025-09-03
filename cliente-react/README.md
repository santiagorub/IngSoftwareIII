# 📱 Cliente React - Sistema de Biblioteca

Este es el **CLIENTE** en la arquitectura Cliente-Servidor, construido con React + TypeScript.

## 🎯 Propósito Educativo

Demuestra:
- **Arquitectura Cliente-Servidor**: Separación física entre frontend y backend
- **Comunicación HTTP/REST**: Cliente consume API del servidor
- **Separación de responsabilidades**: UI vs Lógica de negocio vs Datos
- **Tecnologías especializadas**: React para UI, Node.js para API

## 🏗️ Arquitectura

```
📱 CLIENTE (React)          🖥️ SERVIDOR (Node.js)
┌─────────────────┐        ┌─────────────────────┐
│ Puerto: 5173    │        │ Puerto: 3000        │
│                 │        │                     │
│ React           │   HTTP │ 📱 Presentación     │
│ Components   ←──┼────────┼─→  (Controllers)    │
│ Services        │  REST  │ 💼 Negocio          │
│ State           │        │    (Services)       │
│                 │        │ 💾 Datos            │
└─────────────────┘        │    (Repositories)   │
                           └─────────────────────┘
```

## 📁 Estructura del Proyecto

```
cliente-react/
├── src/
│   ├── components/          # Componentes React
│   │   ├── BookList.tsx     # Lista de libros con filtros
│   │   ├── Dashboard.tsx    # Dashboard con estadísticas
│   │   └── ServerStatus.tsx # Estado de conexión al servidor
│   ├── services/
│   │   └── api.ts           # Comunicación con el servidor
│   ├── types/
│   │   └── api.ts           # Tipos TypeScript de la API
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── package.json
├── vite.config.ts           # Configuración con proxy
└── index.html
```

## 🚀 Cómo Ejecutar

### Prerrequisitos
1. **Servidor funcionando**: El servidor Node.js debe estar ejecutándose en `http://localhost:3000`
2. **Node.js** instalado (versión 16+)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en navegador
http://localhost:5173
```

## 🔗 Comunicación Cliente-Servidor

### Configuración del Proxy
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // ← Servidor Node.js
        changeOrigin: true,
      }
    }
  }
})
```

### Ejemplos de Comunicación

**1. Buscar libros:**
```typescript
// Cliente React hace petición
const books = await booksApi.searchBooks({ title: 'java' });

// Se traduce a:
GET `http://localhost:3000/api/books?title=java`

// Servidor responde:
{ success: true, data: [ { id: "...", title: "Effective Java", ... } ] }
```

**2. Obtener dashboard:**
```typescript
// Cliente solicita datos agregados
const dashboard = await dashboardApi.getDashboardData();

// Se traduce a:
GET `http://localhost:3000/api/dashboard`
```

## 📊 Componentes Principales

### 📚 BookList
- **Responsabilidad**: Mostrar catálogo de libros con filtros
- **Comunicación**: `GET /api/books` con query parameters
- **Estado**: Lista de libros, filtros, loading, errores

### 📊 Dashboard  
- **Responsabilidad**: Mostrar estadísticas consolidadas
- **Comunicación**: `GET /api/dashboard` 
- **Estado**: Datos agregados de libros, usuarios, préstamos

### 🔗 ServerStatus
- **Responsabilidad**: Monitorear conexión con el servidor
- **Comunicación**: `GET /api/health` cada 30 segundos
- **Estado**: Online/offline, información del servidor