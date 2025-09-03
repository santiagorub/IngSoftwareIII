# MVC – Guía detallada (Proyecto mvc-puro)

## ¿Qué es MVC?
Patrón de presentación que separa responsabilidades en tres componentes:
- Model: datos y reglas mínimas del dominio (en este ejemplo, `models/Book.js` con almacenamiento en memoria y validación básica)
- View: representación para el usuario (en este ejemplo, plantillas EJS en `views/`)
- Controller: coordina la interacción HTTP (recibe requests, invoca el modelo, renderiza vistas) (`controllers/BookController.js`)

En este ejemplo “MVC puro” no hay capa de servicios ni repositorios: el Controller habla directamente con el Model y renderiza la View.

## Dónde vive cada componente (mvc/)
- Controller: `mvc-puro/controllers/BookController.js`
- Model: `mvc-puro/models/Book.js`
- Views (EJS):
  - `mvc-puro/views/books/index.ejs` (lista)
  - `mvc-puro/views/books/new.ejs` (formulario)
  - `mvc-puro/views/books/show.ejs` (detalle)
  - Parciales: `mvc-puro/views/partials/header.ejs`, `mvc-puro/views/partials/footer.ejs`

## Flujo típico (Books)
```
GET  /books            → BookController.index()   → Model.all()     → render views/books/index.ejs
GET  /books/new        → BookController.newForm() →                 → render views/books/new.ejs
POST /books            → BookController.create()  → Model.create()   → redirect /books/:id
GET  /books/:id        → BookController.show()    → Model.find(id)   → render views/books/show.ejs
```

## Código ilustrativo (Controller)
```js
// mvc-puro/controllers/BookController.js
const { all, find, create } = require('../models/Book');

class BookController {
  index(req, res) {
    const books = all();
    res.render('books/index', { title: 'Books', books });
  }

  newForm(req, res) {
    res.render('books/new', { title: 'New Book', errors: null, values: {} });
  }

  create(req, res) {
    try {
      const { title, author } = req.body;
      const book = create({ title, author });
      res.redirect(`/books/${book.id}`);
    } catch (err) {
      res.status(400).render('books/new', { title: 'New Book', errors: err.message, values: req.body });
    }
  }

  show(req, res) {
    const book = find(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.render('books/show', { title: book.title, book });
  }
}
```

## Do / Don’t
- Do: mantener reglas mínimas en el Model (p. ej., validación de título/autor)
- Do: usar el Controller solo para coordinar (leer input, invocar Model, elegir la View)
- Do: mantener las Views sin lógica de negocio (mostrar datos y formularios)
- Don’t: poner SQL/BD en el Controller (en este ejemplo no hay BD; es memoria)
- Don’t: mezclar la lógica de render en el Model