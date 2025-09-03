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

module.exports = { BookController };
