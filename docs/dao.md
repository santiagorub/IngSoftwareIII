# DAO (Data Access Object) – Guía detallada

## ¿Qué es?
DAO encapsula operaciones CRUD directamente contra la base de datos. Su foco está en tablas/consultas, no tanto en el modelo de dominio.

- Capa: Acceso a datos (infraestructura)
- Motivación: centralizar SQL/consultas en una única clase por entidad/tabla

## DAO vs Repository
- DAO: piensa en tablas y operaciones (insert/update/delete/select). Devuelve filas/DTOs simples.
- Repository: piensa en entidades/agregados del dominio y oculta storage. Devuelve ENTIDADES de dominio.

En este proyecto elegimos Repository porque la capa de negocio trabaja con entidades `Book`, `User` y reglas.

## Cómo se vería un DAO aquí (conceptual)
```ts
// SOLO conceptual (no incluido en el repo)
class BookDAO {
  async selectById(id: string) { /* SELECT * FROM books WHERE id = ? */ }
  async selectAll() { /* SELECT * FROM books */ }
  async insert(row: any) { /* INSERT INTO books (...) VALUES (...) */ }
  async update(row: any) { /* UPDATE books SET ... WHERE id = ? */ }
  async delete(id: string) { /* DELETE FROM books WHERE id = ? */ }
}
```

## Cuándo usar DAO
- Aplicaciones CRUD simples
- Reportes/ETL donde el dominio es secundario
- Integraciones que trabajan “cerca” de la BD

## Cuándo preferir Repository
- Dominios con reglas de negocio (p. ej., disponibilidad, popularidad)
- Necesidad de aislar storage para testear y cambiar de tecnología

## Pros/Contras
- DAO: + simple y directo; − acopla la capa superior a la BD
- Repository: + orientado a dominio y testable; − más código (mappers/contratos)

## Mapeo al proyecto
- Nuestro `BookRepository` cumple el rol “superior” al DAO porque devuelve `Book` (entidad) y oculta SQL. Si quisieras un DAO adicional, se colocaría por debajo del Repository.
