# MVC Puro - Ejemplo mínimo

Este proyecto demuestra la arquitectura MVC pura (sin capas de servicio ni repositorios), usando Express + EJS y un modelo en memoria.

Estructura:
```
mvc-puro/
├── app.js                 # Arranque de la app, configuración de vistas, rutas
├── controllers/
│   └── BookController.js  # Controlador: coordina requests y respuestas
├── models/
│   └── Book.js            # Modelo: datos y reglas mínimas (en memoria)
└── views/
    ├── layout.ejs         # Layout base
    └── books/
        ├── index.ejs      # Vista: lista de libros
        ├── show.ejs       # Vista: detalle de un libro
        └── new.ejs        # Vista: formulario de alta
```

Cómo correr:
```bash
cd mvc-puro
npm install
npm start
# Abrir http://localhost:3001/books
```

Qué demostrar en clase:
- Model (Book) contiene datos/reglas mínimas; Controller (BookController) coordina; View (EJS) renderiza.
- No hay capa de servicios ni repositorios: Controller conversa directo con el Model.
- Cambiar la vista no toca el modelo; una validación en el modelo impacta todas las acciones.
