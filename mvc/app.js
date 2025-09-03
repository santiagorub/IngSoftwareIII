const express = require('express');
const path = require('path');
const { BookController } = require('./controllers/BookController');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MVC: Controller instancia única y rutas
const bookController = new BookController();

app.get('/', (req, res) => res.redirect('/books'));
app.get('/books', (req, res) => bookController.index(req, res));
app.get('/books/new', (req, res) => bookController.newForm(req, res));
app.post('/books', (req, res) => bookController.create(req, res));
app.get('/books/:id', (req, res) => bookController.show(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MVC Puro ejecutándose en http://localhost:${PORT}/books`);
});
