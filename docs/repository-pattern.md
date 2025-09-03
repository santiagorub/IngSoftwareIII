# Repository Pattern (Guía detallada)

## ¿Qué es?
Un Repository es una abstracción que representa una colección de entidades del dominio (por ejemplo, `Book`). Proporciona operaciones de alto nivel (findById, search, save) hablando el lenguaje del dominio y ocultando detalles de persistencia (SQL, drivers, tablas).

- Capa: Acceso a datos (infraestructura), pero con interfaz orientada al dominio
- Motivación: desacoplar reglas de negocio de la base de datos
- Beneficio: permite reemplazar MySQL por otra tecnología sin tocar la capa de negocio

## Cuándo usarlo
- Cuando tu dominio es relevante (entidades con reglas y vida propia)
- Cuando querés testear la lógica de negocio sin tocar la base de datos
- Cuando necesitás cambiar de storage (MySQL → Mongo/archivo/memoria) con mínimo impacto

## Cuándo NO usarlo
- Crud simple y efímero sin reglas (un script puntual)
- Prototipos desechables

## En este proyecto (capas/)
- Interfaz (contrato estable): `src/data/repositories/IBookRepository.ts`
- Implementación MySQL: `src/data/repositories/BookRepository.ts`
- Consumido por la lógica de negocio: `src/business/services/BookService.ts`

```
Presentation (Controller/DTO) → Business (Service/Entities) → Data (Repository) → MySQL
```

## Fragmentos de código
- Interfaz del repositorio:
```ts
// src/data/repositories/IBookRepository.ts
export interface IBookRepository {
  findById(id: string): Promise<Book | null>;
  search(filters: BookSearchFilters): Promise<Book[]>;
  findAll(): Promise<Book[]>;
  save(book: Book): Promise<Book>;
  updateAvailableCopies(bookId: string, newAvailableCopies: number): Promise<Book | null>;
  delete(id: string): Promise<boolean>;
  generateId(): string;
}
```
- Implementación que oculta SQL y mapea a entidad:
```ts
// src/data/repositories/BookRepository.ts
async search(filters: BookSearchFilters): Promise<Book[]> {
  let query = `SELECT id, isbn, title, author, category, total_copies, available_copies, published_year FROM books WHERE 1=1`;
  const params: any[] = [];
  if (filters.title) { query += ` AND title LIKE ?`; params.push(`%${filters.title}%`); }
  // ...otros filtros...
  const [rows] = await db.execute(query, params);
  return rows.map(row => this.mapRowToBook(row)); // ← entidad de dominio
}
```
- Uso desde negocio (sin SQL):
```ts
// src/business/services/BookService.ts
const books = await this.bookRepository.search(filters);
```

## Buenas prácticas
- El contrato del repo habla en dominio (Book, search, statistics), no en SQL
- Mantener el mapeo fila→entidad dentro del repo
- Dejar validaciones/reglas en Services/Entities (no en el repo)

## Anti‑patrones frecuentes
- Poner lógica de negocio en el repo (cálculo de popularidad, reglas de disponibilidad)
- Exponer métodos tipo `rawQuery()` a la capa de negocio
- Devolver filas crudas en vez de entidades

## Ventajas y trade‑offs
- + Testeable: se mockea `IBookRepository` en tests de negocio
- + Portabilidad: cambiar storage sin tocar Services
- − Puede requerir más código (mappers, interfaces)

## Actividad para clase (5’)
“Si pasáramos a MongoDB, ¿qué archivos cambiarías?”
- Esperado: crear `MongoBookRepository` que implemente `IBookRepository` y ajustar el wiring en `src/app.ts`.
