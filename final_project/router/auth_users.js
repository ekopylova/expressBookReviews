const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    let validUser = users.find(user => user.username === username && user.password === password);
    return !!validUser;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

    // Check credentials
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: 60 * 60 }
    );

    // Store token in session
    req.session.authorization = {
        accessToken
    };

    return res.status(200).json({ message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required" });
    }
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    const username = req.user && req.user.username;
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    if (!book.reviews) {
        book.reviews = {};
    }
    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.user && req.user.username;
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!book.reviews) {
        return res.status(404).json({ message: "No reviews for this book" });
    }
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "No review by this user for this book" });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: "Reviews deleted successfully",
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
