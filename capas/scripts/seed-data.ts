#!/usr/bin/env npx ts-node

/// <reference types="node" />

/**
 * SCRIPT DE CARGA DE DATOS DE MUESTRA
 * 
 * Pobla la base de datos con datos realistas para demostración
 * Se puede ejecutar múltiples veces sin problemas (idempotente)
 */

import { initializeDatabase, testConnection } from '../src/config/database';
import { BookRepository } from '../src/data/repositories/BookRepository';
import { UserRepository } from '../src/data/repositories/UserRepository';
import { Book } from '../src/business/entities/Book';
import { User, UserType } from '../src/business/entities/User';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

// Cargar variables de entorno
``
class DataSeeder {
    private bookRepository: BookRepository;
    private userRepository: UserRepository;

    constructor() {
        this.bookRepository = new BookRepository();
        this.userRepository = new UserRepository();
        // Sin préstamos en la versión simplificada
    }

    /**
     * Ejecuta la carga completa de datos
     */
    async run(): Promise<void> {
        console.log('🌱 Starting data seeding process...');
        console.log('');

        try {
            // Verificar conexión a la base de datos
            await this.checkDatabase();
            
            // Cargar datos en orden (usuarios -> libros -> préstamos)
            await this.seedUsers();
            await this.seedBooks();
            // Sin préstamos en la versión simplificada
            
            // Mostrar estadísticas finales
            await this.showStatistics();
            
            console.log('');
            console.log('✅ Data seeding completed successfully!');
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Error during data seeding:', error);
            process.exit(1);
        }
    }

    /**
     * Verifica la conexión a la base de datos
     */
    private async checkDatabase(): Promise<void> {
        console.log('🔧 Checking database connection...');
        initializeDatabase();
        
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Could not connect to database. Make sure Docker is running.');
        }
        console.log('✅ Database connection OK');
        console.log('');
    }

    /**
     * Carga usuarios de muestra
     */
    private async seedUsers(): Promise<void> {
        console.log('👥 Seeding users...');
        
        const users = [
            // Estudiantes
            { email: 'diego.hernandez@universidad.edu', name: 'Diego Hernández', type: 'STUDENT' as UserType },
            { email: 'lucia.morales@universidad.edu', name: 'Lucía Morales', type: 'STUDENT' as UserType },
            { email: 'alejandro.castro@universidad.edu', name: 'Alejandro Castro', type: 'STUDENT' as UserType },
            { email: 'valentina.silva@universidad.edu', name: 'Valentina Silva', type: 'STUDENT' as UserType },
            { email: 'mateo.vargas@universidad.edu', name: 'Mateo Vargas', type: 'STUDENT' as UserType },
            { email: 'isabella.ramos@universidad.edu', name: 'Isabella Ramos', type: 'STUDENT' as UserType },
            
            // Profesores
            { email: 'dr.gonzalez@universidad.edu', name: 'Dr. Luis González', type: 'PROFESSOR' as UserType },
            { email: 'dra.fernandez@universidad.edu', name: 'Dra. Carmen Fernández', type: 'PROFESSOR' as UserType },
            { email: 'prof.torres@universidad.edu', name: 'Prof. Ricardo Torres', type: 'PROFESSOR' as UserType },
            
            // Bibliotecarios
            { email: 'isabel.bibliotecaria@biblioteca.edu', name: 'Isabel Mendoza', type: 'LIBRARIAN' as UserType },
        ];

        let newUsers = 0;
        for (const userData of users) {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (!existingUser) {
                const user = new User(
                    this.userRepository.generateId(),
                    userData.email,
                    userData.name,
                    userData.type,
                    true,
                    0
                );
                await this.userRepository.save(user);
                newUsers++;
                console.log(`  ✓ Created ${userData.type.toLowerCase()}: ${userData.name}`);
            }
        }
        
        console.log(`📊 Users: ${newUsers} new users created`);
        console.log('');
    }

    /**
     * Carga libros de muestra
     */
    private async seedBooks(): Promise<void> {
        console.log('📚 Seeding books...');
        
        const books = [
            // Programación y Desarrollo
            { isbn: '978-0134757599', title: 'Refactoring: Improving the Design of Existing Code', author: 'Martin Fowler', category: 'Programming', copies: 4, year: 2018 },
            { isbn: '978-0135974445', title: 'Agile Software Development', author: 'Robert C. Martin', category: 'Software Engineering', copies: 3, year: 2019 },
            { isbn: '978-0321146533', title: 'Test Driven Development', author: 'Kent Beck', category: 'Software Engineering', copies: 5, year: 2002 },
            { isbn: '978-0596516178', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Programming', copies: 6, year: 2008 },
            { isbn: '978-0134494166', title: 'Clean Architecture', author: 'Robert C. Martin', category: 'Architecture', copies: 4, year: 2017 },
            
            // Bases de Datos
            { isbn: '978-0123747303', title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', category: 'Database', copies: 3, year: 2019 },
            { isbn: '978-0321884497', title: 'Database Design for Mere Mortals', author: 'Michael J. Hernandez', category: 'Database', copies: 2, year: 2013 },
            
            // Algoritmos y Estructuras de Datos
            { isbn: '978-0132126427', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Algorithms', copies: 5, year: 2009 },
            { isbn: '978-0321635747', title: 'Algorithms', author: 'Robert Sedgewick', category: 'Algorithms', copies: 3, year: 2011 },
            
            // Redes y Sistemas
            { isbn: '978-0132126953', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Networks', copies: 2, year: 2018 },
            { isbn: '978-0136006633', title: 'Operating System Concepts', author: 'Abraham Silberschatz', category: 'Operating Systems', copies: 4, year: 2018 },
            
            // Ingeniería de Software
            { isbn: '978-0133943030', title: 'Software Engineering: Theory and Practice', author: 'Shari Lawrence Pfleeger', category: 'Software Engineering', copies: 3, year: 2014 },
            { isbn: '978-0136108047', title: 'Software Engineering', author: 'Ian Sommerville', category: 'Software Engineering', copies: 4, year: 2015 },
            
            // Inteligencia Artificial
            { isbn: '978-0134610993', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', category: 'AI', copies: 3, year: 2020 },
            { isbn: '978-0262035613', title: 'Deep Learning', author: 'Ian Goodfellow', category: 'AI', copies: 2, year: 2016 },
        ];

        let newBooks = 0;
        for (const bookData of books) {
            const existingBook = await this.bookRepository.existsByISBN(bookData.isbn);
            if (!existingBook) {
                const book = new Book(
                    uuidv4(),
                    bookData.isbn,
                    bookData.title,
                    bookData.author,
                    bookData.category,
                    bookData.copies,
                    bookData.copies, // Inicialmente todas las copias están disponibles
                    bookData.year
                );
                await this.bookRepository.save(book);
                newBooks++;
                console.log(`  ✓ Created book: ${bookData.title}`);
            }
        }
        
        console.log(`📊 Books: ${newBooks} new books created`);
        console.log('');
    }

    /**
     * Carga préstamos de muestra
     */
    // Eliminado: seedLoans para simplificar

    /**
     * Muestra estadísticas finales
     */
    private async showStatistics(): Promise<void> {
        console.log('📊 Final Statistics:');
        console.log('');

        // Estadísticas de libros
        const bookStats = await this.bookRepository.getStatistics();
        console.log('📚 Books:');
        console.log(`  • Total books: ${bookStats.totalBooks}`);
        console.log(`  • Total copies: ${bookStats.totalCopies}`);
        console.log(`  • Available copies: ${bookStats.availableCopies}`);
        console.log(`  • Categories: ${bookStats.categoriesCount}`);
        console.log('');

        // Estadísticas de usuarios
        const userStats = await this.userRepository.getStatistics();
        console.log('👥 Users:');
        console.log(`  • Total users: ${userStats.totalUsers}`);
        console.log(`  • Active users: ${userStats.activeUsers}`);
        console.log(`  • Students: ${userStats.usersByType.students || 0}`);
        console.log(`  • Professors: ${userStats.usersByType.professors || 0}`);
        console.log(`  • Librarians: ${userStats.usersByType.librarians || 0}`);
        console.log('');

        // Sin estadísticas de préstamos en la versión simplificada
    }
}

// Ejecutar el script
const seeder = new DataSeeder();
seeder.run();
