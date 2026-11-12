const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");
const regd_users = express.Router();
const users = [];

const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  return res.json({ message: "Customer successfully logged in" });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  const review = req.query.review;
  if (typeof review !== "string" || !review.trim()) return res.status(400).json({ message: "Review is required" });
  book.reviews[req.user.username] = review;
  return res.json({ message: `The review for the book with ISBN ${req.params.isbn} has been added/updated.`, reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) return res.status(404).json({ message: "Review not found" });
  delete book.reviews[req.user.username];
  return res.json({ message: `Reviews for the ISBN ${req.params.isbn} posted by the user ${req.user.username} deleted.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
