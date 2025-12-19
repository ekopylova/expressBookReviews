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

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
