const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper that returns books via a Promise
const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(Object.values(books));
        } else {
            reject(new Error("No books available"));
        }
    });
}

// Helper that returns a book via ISBN via a Promise
const getBookViaISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found!"));
        }
    });
}

// Helper that returns a book based on Author via a Promise
const getBookViaAuthor = (author) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.author === author);
        if (matchingBooks.length === 0) {
            reject(new Error("No books found for this author"));
        } else {
            resolve(matchingBooks);
        }
    });
}

// Helper that returns a book based on Title via a Promise
const getBookViaTitle = (title) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.title === title);
        if (matchingBooks.length === 0) {
            reject(new Error("No books found for this title"));
        } else {
            resolve(matchingBooks);
        }
    });
}

// Register a user
public_users.post("/register", (req,res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "User already exists" });
    }
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const allBooks = await getBooks();
      return res.status(200).json(allBooks);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookViaISBN(isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }    
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBookViaAuthor(author);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err.message});
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getBookViaTitle(title);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err.message});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    const reviews = book.reviews;
    return res.status(200).json(reviews); 
});

module.exports.general = public_users;
