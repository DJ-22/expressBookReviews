const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists" });
    }
  
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});  

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();
    const matchingBooks = [];

    for (const key in books) {
        if (books[key].author.toLowerCase() === author) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    }

    return res.status(200).json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const matchingBooks = [];

    for (const key in books) {
        if (books[key].title.toLowerCase() === title) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    }

    return res.status(200).json(matchingBooks);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/async-books', async (req, res) => {
    try {
        const response = await axios.get('https://jaindaksh006-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books asynchronously" });
    }
});

public_users.get('/promise-isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    axios.get('https://jaindaksh006-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/')
        .then(response => {
            const book = response.data[isbn];
            if (book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ message: "Book not found" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Failed to fetch book by ISBN" });
        });
});  

public_users.get('/async-author/:author', async (req, res) => {
    const author = req.params.author;
  
    try {
        const response = await axios.get('https://jaindaksh006-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
        const booksData = response.data;
  
        const matchingBooks = Object.values(booksData).filter(book => book.author === author);
  
        if (matchingBooks.length > 0) {
            res.status(200).json(matchingBooks);
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch books by author" });
    }
});  

public_users.get('/async-title/:title', async (req, res) => {
    const title = req.params.title;
  
    try {
        const response = await axios.get('https://jaindaksh006-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
        const booksData = response.data;
  
        const matchingBooks = Object.values(booksData).filter(book => book.title === title);
  
        if (matchingBooks.length > 0) {
            res.status(200).json(matchingBooks);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch books by title" });
    }
  });
  
module.exports.general = public_users;