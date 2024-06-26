const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const public_users = express.Router();



// Endpoint para registrar un nuevo usuario
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Verificar si tanto el username como el password son proporcionados
  if (username && password) {
    // Verificar si el usuario no existe utilizando la función isValid
    if (!isValid(username)) {
      // Agregar el nuevo usuario al array de usuarios
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Devolver error si falta el username o el password
  return res.status(400).json({ message: "Unable to register user. Username or password missing." });
});


// Get the book list available in the shop
const fetchBooks = () => {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          resolve(books);
      }, 1000); // Simula un retraso de 1 segundo
  });
};

public_users.get('/', async (req, res) => {
  try {
      const booksList = await fetchBooks();
      res.status(200).json(booksList);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books list" });
  }
});

// Get book details based on ISBN
// Función para obtener detalles del libro basado en el ISBN
const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          const book = books.find(b => b.isbn === isbn);
          if (book) {
              resolve(book);
          } else {
              reject({ message: "Book not found" });
          }
      }, 1000); // Simula un retraso de 1 segundo
  });
};

// Endpoint para obtener detalles del libro basado en el ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
      const book = await fetchBookByISBN(isbn);
      res.status(200).json(book);
  } catch (error) {
      res.status(404).json(error);
  }
});


// Get book details based on author
const fetchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBooks = books.filter(book => book.author === author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ message: "Books by this author not found" });
      }
    }, 1000); // Simula un retraso de 1 segundo
  });
};
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const filteredBooks = await fetchBooksByAuthor(author);
    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(404).json(error);
  }
});


// Get all books based on title
const fetchBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBooks = books.filter(book => book.title === title);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ message: "Books with this title not found" });
      }
    }, 1000); // Simula un retraso de 1 segundo
  });
};
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const filteredBooks = await fetchBooksByTitle(title);
    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(404).json(error);
  }
});



// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);
  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "Book without reviews" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
