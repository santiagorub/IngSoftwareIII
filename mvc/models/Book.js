class Book {
  constructor(id, title, author) {
    if (!title || title.length < 2) throw new Error('Title must have at least 2 characters');
    if (!author || author.length < 2) throw new Error('Author must have at least 2 characters');
    this.id = id;
    this.title = title;
    this.author = author;
  }
}

// Almacén en memoria (parte del Model en este ejemplo sencillo)
const _store = {
  nextId: 3,
  items: [
    new Book(1, 'Clean Architecture', 'Robert C. Martin'),
    new Book(2, 'Refactoring', 'Martin Fowler')
  ]
};

function all() { return _store.items; }
function find(id) { return _store.items.find(b => String(b.id) === String(id)) || null; }
function create(attrs) {
  const book = new Book(_store.nextId++, attrs.title, attrs.author);
  _store.items.push(book);
  return book;
}

module.exports = { Book, all, find, create };
