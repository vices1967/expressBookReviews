const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if any user with the same username exists
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if there is any user with the provided username and password
    return users.some(user => user.username === username && user.password === password);
};

// Login endpoint
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username or password missing" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

        // Store access token and username in session
        req.session.authorization = { accessToken, username };

        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login credentials" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization?.username; // Obtener username de la sesión

  if (!username) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
  }

  // Buscar el libro por su campo ISBN en la base de datos
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Verificar si el usuario ya ha dejado una reseña para este libro
  if (book.reviews && book.reviews[username]) {
      // Actualizar la reseña existente
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
  } else {
      // Agregar una nueva reseña
      if (!book.reviews) {
          book.reviews = {};
      }
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully" });
  }
});

// Endpoint para eliminar una reseña de libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization?.username; // Obtener username de la sesión

  if (!username) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
  }

  // Buscar el libro por su campo ISBN en la base de datos
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Verificar si el usuario ha dejado una reseña para este libro
  if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
  }

  // Eliminar la reseña del usuario
  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
