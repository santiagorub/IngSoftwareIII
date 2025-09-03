# 🎓 Ejemplos de Arquitectura de Software - IS3

Material completo para enseñar conceptos fundamentales de arquitectura de software con ejemplos prácticos y funcionales.

## 🎯 Objetivo Educativo

Este repositorio contiene material para explicar y demostrar:

1. **Estilos Arquitectónicos** vs **Patrones de Diseño**
2. **Arquitectura en Capas** con implementación real
3. **Arquitectura Cliente-Servidor** con aplicaciones separadas
4. **API REST** como protocolo de comunicación
5. **Patrón MVC** integrado en arquitectura en capas
6. **Ventajas de la separación** vs código monolítico

## 📁 Estructura del Proyecto

```
Ejemplos-IS3/
├── clase1-estilos-arquitectonicos.md    # 📚 Clase completa (2 horas)
├── capas/                               # 🖥️ SERVIDOR (Node.js + MySQL)
│   ├── src/
│   │   ├── business/                    # Capa de Lógica de Negocio
│   │   ├── data/                        # Capa de Acceso a Datos  
│   │   ├── presentation/                # Capa de Presentación (MVC)
│   │   └── examples/                    # Ejemplo MALO sin capas
│   ├── database/                        # Scripts SQL
│   ├── docker-compose.yml               # MySQL con Docker
│   └── README.md
├── cliente-react/                       # 📱 CLIENTE (React + TypeScript)
│   ├── src/
│   │   ├── components/                  # Componentes React
│   │   ├── services/                    # Comunicación con API
│   │   └── types/                       # Tipos TypeScript
│   └── README.md
└── README.md                            # Este archivo
```

## 🏗️ Arquitectura (Simplificada)

```
📱 CLIENTE REACT                     🖥️ SERVIDOR NODE.JS
┌─────────────────────┐              ┌─────────────────────────┐
│ Puerto: 5173        │              │ Puerto: 3000            │
│                     │     HTTP     │                         │
│ React Components    │ ←── REST ──→ │ 📱 PRESENTACIÓN         │
│ Axios API Client    │     JSON     │   Controllers (MVC)     │
│ TypeScript Types    │              │   DTOs & Mappers        │
│ State Management    │              │   Routes                │
│                     │              │          ↕              │
└─────────────────────┘              │ 💼 LÓGICA DE NEGOCIO    │
                                     │   Services              │
                                     │   Entities              │
                                     │   Business Rules        │
                                     │          ↕              │
                                     │ 💾 ACCESO A DATOS       │
                                     │   Repositories          │
                                     │   Data Models           │
                                     │          ↕              │
                                     │ 🗄️ MYSQL DATABASE       │
                                     │   Puerto: 3307          │
                                     │   Docker Container      │
                                     └─────────────────────────┘
```

## 🚀 Guía de Inicio Rápido

### 1. Levantar el Sistema Completo

```bash
# 1. Clonar e instalar servidor
cd capas/
npm install

# 2. Levantar base de datos
npm run docker:up

# 3. Esperar que MySQL inicie (30 segundos)
sleep 30

# 4. Arrancar servidor API
npm run dev

# En otra terminal:
# 5. Instalar cliente React
cd ../cliente-react/
npm install

# 6. Arrancar cliente React
npm run dev
```

### 2. Verificar que Todo Funcione

- **Servidor API**: http://localhost:3000 (debería mostrar info del sistema)
- **Cliente React**: http://localhost:5173 (interfaz web completa)
- **Base de Datos**: PhpMyAdmin en http://localhost:8080 (opcional)

### 3. Probar la Comunicación Cliente-Servidor

```bash
# Desde el servidor
curl http://localhost:3000/api/health

# Desde el cliente React:
# - Ir a http://localhost:5173
# - Ver que el "Estado del Servidor" esté en verde ✅
# - Usar filtros de búsqueda en Catálogo
```

## 📚 Material de Clase

### 📖 Clase Teórico-Práctica (2 horas)

El archivo `clase1-estilos-arquitectonicos.md` contiene:

- ✅ **Objetivos** claros de aprendizaje
- ✅ **Actividades** interactivas cada 15-20 minutos  
- ✅ **Ejercicios grupales** con casos reales
- ✅ **Demostraciones** en vivo con código funcionando
- ✅ **Comparaciones** directas entre enfoques
- ✅ **Preguntas** para verificar comprensión

### 🎯 Conceptos Cubiertos

1. **Estilos vs Patrones**:
   - Definiciones claras con ejemplos
   - Niveles de abstracción (macro vs micro)
   - Cómo se complementan entre sí

2. **Arquitectura en Capas**:
   - Principios: separación, dependencias, abstracción
   - Implementación real con TypeScript
   - Comparación con código sin capas

3. **Cliente-Servidor**:
   - Separación física de aplicaciones
   - Comunicación HTTP/REST
   - Ventajas de la distribución

4. **API REST**:
   - Recursos, verbos HTTP, estateless
   - Implementación práctica
   - Ejemplos de endpoints reales

5. **Patrón MVC**:
   - Dentro de la capa de presentación
   - Controllers, DTOs (Models), JSON (Views)
   - Separación de responsabilidades

## 🎓 Para Profesores

### Cómo Usar este Material

**Preparación (15 min antes de clase):**
```bash
cd capas/
npm run setup  # Instala deps + levanta Docker
npm run dev    # En background
```

**Durante la clase:**
1. **Explicar conceptos** con `clase1-estilos-arquitectonicos.md`
2. **Demostrar en vivo** con el servidor funcionando
3. **Mostrar cliente React** comunicándose con la API
4. **Comparar** con el archivo `without-layers-BAD-EXAMPLE.ts`
5. **Hacer ejercicios grupales** del material

**Puntos clave para demostrar:**
- ✅ Un request viaja: React → Controller → Service → Repository → MySQL
- ✅ Cambiar algo en la base de datos no afecta la UI
- ✅ El cliente React puede correr independiente del servidor
- ✅ Misma API sirve tanto para web como para móvil (futuro)

### Adaptación por Nivel

**2do año (base débil):**
- Enfocarse en analogías (edificio, restaurante)
- Usar más el ejemplo visual del cliente React
- Menos código, más diagramas
- Ejercicios con tarjetas físicas

**Años avanzados:**
- Entrar en detalles de implementación
- Mostrar testing unitario por capas
- Explicar inyección de dependencias
- Discutir microservicios como evolución

## 🔧 Ejemplos Específicos para Clase

### 1. Demostrar Ventajas de Capas

**🚫 Código malo (sin capas):**
```bash
# Mostrar: src/examples/without-layers-BAD-EXAMPLE.ts
# Problemas: todo mezclado, duplicación, no testeable
```

**✅ Código bueno (con capas):**
```bash
# Mostrar: misma funcionalidad dividida en:
# - BookController.ts (HTTP)
# - BookService.ts (reglas)  
# - BookRepository.ts (datos)
```

### 2. Demostrar Cliente-Servidor

```bash
# Terminal 1: Parar el servidor
pkill -f "npm run dev"

# En React: mostrar error de conexión ❌

# Terminal 1: Reiniciar servidor
npm run dev  

# En React: mostrar conexión restaurada ✅
```

### 3. Demostrar REST

```bash
# Mostrar en navegador/Postman:
GET  http://localhost:3000/api/books
GET  http://localhost:3000/api/books?title=java
GET  http://localhost:3000/api/users
```

### 4. Demostrar MVC

En BookController.ts mostrar:
- **Controller**: valida HTTP, llama service, formatea response
- **Model** (DTO): `BookDTO` representa datos para la vista
- **View**: respuesta JSON que consume React

## 🛠️ Extensiones Sugeridas

### Para Estudiantes Avanzados

1. **Agregar autenticación JWT**
2. **Implementar paginación** en lista de libros
3. **Crear app móvil** que use la misma API
4. **Agregar tests unitarios** por cada capa
5. **Implementar cache** con Redis
6. **Documentar API** con Swagger/OpenAPI

### Para Proyectos Finales

1. **Microservicios**: dividir en servicios independientes
2. **Event Sourcing**: para auditoría completa
3. **CQRS**: separar comandos de consultas
4. **GraphQL**: como alternativa a REST
5. **WebSockets**: para notificaciones en tiempo real

## 📊 Métricas del Proyecto

- **Servidor**: ~50 archivos, ~3000 líneas TypeScript
- **Cliente**: ~15 archivos, ~1500 líneas TypeScript + TSX
- **Base de datos**: 3 tablas, datos de ejemplo incluidos
- **Endpoints**: 20+ endpoints REST completamente funcionales
- **Cobertura**: Libros, Usuarios, Préstamos, Dashboard, Estadísticas

## 🎉 ¿Por Qué Este Proyecto es Especial?

### ✅ **Completamente Funcional**
- No es solo teoría, es un sistema real que funciona
- Base de datos real, API real, interfaz real
- Se puede usar como base para proyectos estudiantiles

### ✅ **Progresión Pedagógica**
- Empieza con conceptos simples
- Construye complejidad gradualmente  
- Conecta teoría con práctica
- Permite "tocar" la arquitectura

### ✅ **Código Profesional**
- TypeScript con tipos estrictos
- Separación clara de responsabilidades
- Manejo de errores apropiado
- Documentación completa

### ✅ **Múltiples Perspectivas**
- Vista del arquitecto: decisiones de alto nivel
- Vista del desarrollador: implementación concreta
- Vista del usuario: interfaz funcional
- Vista del DevOps: Docker, despliegue

---

## 🤝 Contribuciones

Este material está diseñado para ser:
- ✅ **Reutilizable**: otros profesores pueden adaptarlo
- ✅ **Extensible**: estudiantes pueden agregar funcionalidades
- ✅ **Actualizable**: fácil mantener con nuevas tecnologías

**¡Perfecto para transformar la comprensión de arquitectura de software! 🎓🚀**
