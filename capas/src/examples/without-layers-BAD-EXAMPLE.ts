/**
 * Este archivo demuestra cómo se ve el código cuando NO usamos arquitectura en capas.
 *
 * PROBLEMAS QUE VAMOS A VER:
 * 1. 🍝 Código espagueti - todo mezclado
 * 2. 🔄 Duplicación de lógica
 * 3. 🚧 Difícil de mantener
 * 4. 🧪 Imposible de testear
 * 5. 👥 No se puede trabajar en equipo
 * 6. 📱 No se puede reutilizar para móvil
 */

import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// ❌ PROBLEMA 1: Configuración mezclada con lógica
const app = express();
app.use(express.json());

// ❌ PROBLEMA 2: Conexión a BD en cada endpoint
const DB_CONFIG = {
    host: 'localhost',
    port: 3307,
    user: 'biblioteca_user',
    password: 'biblioteca_pass',
    database: 'biblioteca_db',
};

/**
 * ❌ ENDPOINT PARA BUSCAR LIBROS - TODO MEZCLADO
 *
 * En este endpoint tenemos:
 * - Validación HTTP ✓ (debería estar en presentación)
 * - Conexión a base de datos ✗ (debería estar en datos)
 * - Lógica de negocio ✗ (debería estar en negocio)
 * - Formateo de respuesta ✗ (debería estar en presentación)
 */
app.get('/libros-malo', async (req: Request, res: Response) => {
    let conexion;

    try {
        // ❌ PRESENTACIÓN: Validación HTTP mezclada
        const titulo = req.query.titulo as string;
        const categoria = req.query.categoria as string;

        // ❌ DATOS: Conexión a BD en el endpoint
        conexion = await mysql.createConnection(DB_CONFIG);

        // ❌ DATOS: Query SQL en el endpoint
        let query = 'SELECT * FROM books WHERE 1=1';
        const params: any[] = [];

        if (titulo) {
            // ❌ PRESENTACIÓN: Validación de negocio mezclada con HTTP
            if (titulo.length < 2) {
                return res.status(400).json({ error: 'Título muy corto' });
            }
            query += ' AND title LIKE ?';
            params.push(`%${titulo}%`);
        }

        if (categoria) {
            query += ' AND category = ?';
            params.push(categoria);
        }

        const [libros] = (await conexion.execute(query, params)) as mysql.RowDataPacket[][];

        // ❌ NEGOCIO: Lógica de negocio mezclada
        const librosConInfo = libros.map((libro: any) => {
            // ❌ Esta lógica debería estar en la entidad Book
            const disponible = libro.available_copies > 0;
            const popularidad = libro.available_copies / libro.total_copies < 0.3;
            const esReciente = new Date().getFullYear() - libro.published_year <= 5;

            // ❌ PRESENTACIÓN: Formateo mezclado con lógica
            return {
                id: libro.id,
                titulo: libro.title, // ❌ Cambié nombres de campos aquí
                autor: libro.author,
                disponible,
                popular: popularidad,
                reciente: esReciente,
            };
        });

        // ❌ PRESENTACIÓN: Response mezclado
        res.json({ success: true, libros: librosConInfo });
    } catch (error) {
        console.error(error); // ❌ Log mezclado
        res.status(500).json({ error: 'Error buscando libros' });
    } finally {
        if (conexion) {
            await conexion.end(); // ❌ Manejo de conexiones duplicado
        }
    }
});

/**
 * ❌ ENDPOINT PARA CREAR PRÉSTAMO - AÚN PEOR
 *
 * Aquí vamos a ver TODOS los problemas juntos:
 */
app.post('/prestamo-malo', async (req: Request, res: Response) => {
    let conexion;

    try {
        // ❌ PRESENTACIÓN: Validación básica mezclada
        const { usuarioId, libroId } = req.body;

        if (!usuarioId || !libroId) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        // ❌ DATOS: Otra conexión duplicada
        conexion = await mysql.createConnection(DB_CONFIG);

        // ❌ NEGOCIO + DATOS: Todo mezclado sin separación

        // Verificar que el usuario existe
        const [usuarios] = (await conexion.execute('SELECT * FROM users WHERE id = ?', [
            usuarioId,
        ])) as mysql.RowDataPacket[][];

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        // ❌ NEGOCIO: Lógica de límites hardcodeada y duplicada
        let limite;
        if (usuario.user_type === 'STUDENT') {
            limite = 3;
        } else if (usuario.user_type === 'PROFESSOR') {
            limite = 10;
        } else {
            limite = 15;
        }

        if (usuario.current_loans >= limite) {
            return res.status(400).json({
                error: `El ${usuario.user_type} no puede tener más de ${limite} préstamos`,
            });
        }

        // Verificar que el libro existe y está disponible
        const [libros] = (await conexion.execute('SELECT * FROM books WHERE id = ?', [
            libroId,
        ])) as mysql.RowDataPacket[][];

        if (libros.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        const libro = libros[0];

        if (libro.available_copies <= 0) {
            return res.status(400).json({ error: 'Libro no disponible' });
        }

        // Verificar que no tenga ya el libro
        const [prestamosExistentes] = (await conexion.execute(
            'SELECT * FROM loans WHERE user_id = ? AND book_id = ? AND status = "ACTIVE"',
            [usuarioId, libroId],
        )) as mysql.RowDataPacket[][];

        if (prestamosExistentes.length > 0) {
            return res.status(400).json({ error: 'Ya tiene este libro prestado' });
        }

        // ❌ NEGOCIO: Cálculo de fechas hardcodeado
        const fechaPrestamo = new Date();
        const fechaVencimiento = new Date();

        // ❌ Misma lógica duplicada otra vez
        if (usuario.user_type === 'STUDENT') {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 14);
        } else if (usuario.user_type === 'PROFESSOR') {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        } else {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 60);
        }

        // ❌ DATOS: Operaciones de BD sin transacciones
        const prestamoId = uuidv4();

        // Crear préstamo
        await conexion.execute(
            'INSERT INTO loans (id, user_id, book_id, loan_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
            [prestamoId, usuarioId, libroId, fechaPrestamo, fechaVencimiento, 'ACTIVE'],
        );

        // Actualizar copias disponibles
        await conexion.execute('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [libroId]);

        // Actualizar contador del usuario
        await conexion.execute('UPDATE users SET current_loans = current_loans + 1 WHERE id = ?', [usuarioId]);

        // ❌ PRESENTACIÓN: Respuesta inconsistente con otros endpoints
        res.json({
            ok: true, // ❌ Diferente a "success" de arriba
            prestamo: {
                id: prestamoId,
                usuario: usuario.name,
                libro: libro.title,
                vence: fechaVencimiento.toISOString(),
            },
        });
    } catch (error) {
        console.error('Error creando préstamo:', error);

        // ❌ No hay rollback, los datos quedan inconsistentes
        res.status(500).json({ error: 'Error interno' });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

/**
 * ❌ OTRO ENDPOINT CON LA MISMA LÓGICA DUPLICADA
 *
 * Para devolver un libro también necesito la lógica de usuarios,
 * pero como está toda mezclada, tengo que duplicar código:
 */
app.post('/devolver-malo/:prestamoId', async (req: Request, res: Response) => {
    let conexion;

    try {
        const prestamoId = req.params.prestamoId;
        conexion = await mysql.createConnection(DB_CONFIG);

        // ❌ DUPLICACIÓN: Misma query que en crear préstamo
        const [prestamos] = (await conexion.execute('SELECT * FROM loans WHERE id = ? AND status = "ACTIVE"', [
            prestamoId,
        ])) as mysql.RowDataPacket[][];

        if (prestamos.length === 0) {
            return res.status(404).json({ error: 'Préstamo no encontrado' });
        }

        const prestamo = prestamos[0];

        // ❌ Sin transacciones otra vez
        await conexion.execute('UPDATE loans SET status = "RETURNED", return_date = NOW() WHERE id = ?', [prestamoId]);

        await conexion.execute('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [
            prestamo.book_id,
        ]);

        await conexion.execute('UPDATE users SET current_loans = current_loans - 1 WHERE user_id = ?', [
            prestamo.user_id,
        ]);

        res.json({ mensaje: 'Libro devuelto' }); // ❌ Formato diferente otra vez
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error' });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

/**
 * ❌ FUNCIÓN PARA VALIDAR EMAIL - DUPLICADA EN VARIOS LUGARES
 *
 * Como no hay capas, cada endpoint que necesita validar email
 * tiene su propia versión de esta función
 */
function validarEmail1(email: string): boolean {
    return email.includes('@') && email.includes('.');
}

function validarEmail2(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // ❌ Diferente lógica
}

// ❌ Y probablemente habría una tercera versión en otro archivo...

/**
 * ❌ PROBLEMAS EVIDENTES DE ESTE ENFOQUE:
 *
 * 1. 🍝 CÓDIGO ESPAGUETI:
 *    - HTTP, SQL, lógica de negocio, todo mezclado
 *    - Imposible saber qué hace cada parte
 *
 * 2. 🔄 DUPLICACIÓN MASIVA:
 *    - Conexión a BD en cada endpoint
 *    - Lógica de límites repetida 3 veces
 *    - Validaciones diferentes en cada lugar
 *
 * 3. 🚧 MANTENIMIENTO IMPOSIBLE:
 *    - Para cambiar límites de estudiante, tengo que buscar en TODO el código
 *    - Si cambio la BD, tengo que tocar cada endpoint
 *    - Un bug se replica en múltiples lugares
 *
 * 4. 🧪 TESTING IMPOSIBLE:
 *    - No puedo testear lógica de negocio sin levantar HTTP y BD
 *    - No puedo mockear partes del sistema
 *    - Tests serían súper lentos
 *
 * 5. 👥 TRABAJO EN EQUIPO IMPOSIBLE:
 *    - Un dev no puede trabajar en BD mientras otro en HTTP
 *    - Conflictos constantes en Git
 *    - No hay especialización posible
 *
 * 6. 📱 REUTILIZACIÓN IMPOSIBLE:
 *    - Para hacer una app móvil, tengo que duplicar TODA la lógica
 *    - No puedo crear una API para terceros
 *    - Cada cliente necesita su propia implementación
 *
 * 7. 🔒 SEGURIDAD COMPROMETIDA:
 *    - Credenciales de BD por todos lados
 *    - No hay punto central para validaciones
 *    - Fácil introducir vulnerabilidades
 *
 * 8. 📊 PERFORMANCE TERRIBLE:
 *    - Nueva conexión a BD en cada request
 *    - No hay cache posible
 *    - No se puede optimizar por partes
 */

/**
 * 🎓 PARA LA CLASE:
 *
 * Mostrar este archivo DESPUÉS de explicar la arquitectura en capas.
 *
 * Preguntar:
 * - "¿Qué problemas ven aquí?"
 * - "¿Cómo lo solucionaríamos con capas?"
 * - "¿Dónde pondríamos cada parte del código?"
 *
 * Luego mostrar cómo el mismo endpoint se ve en el código con capas:
 * - BookController.searchBooks() - solo HTTP
 * - BookService.searchBooks() - solo reglas
 * - BookRepository.search() - solo datos
 */

console.log(`
❌ ESTE ES EL ARCHIVO DEL "CÓMO NO HACERLO"
❌ Para ejecutar: node dist/examples/without-layers-BAD-EXAMPLE.js
❌ Compara este código con la versión con capas en src/presentation/controllers/
`);

export default app;
