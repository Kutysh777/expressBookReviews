const express = require("express");
const axios = require("axios");
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
  if (isValid(username)) return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// This local catalog endpoint provides data to the Axios requests below.
public_users.get("/catalog-data", (req, res) => res.json(books));
const getCatalog = async () => (await axios.get("http://127.0.0.1:5000/catalog-data", { proxy: false })).data;

public_users.get("/", async (req, res) => {
  try { return res.json(await getCatalog()); }
  catch (error) { return res.status(500).json({ message: "Unable to retrieve books" }); }
});

public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const catalog = await getCatalog();
    const book = catalog[req.params.isbn];
    return book ? res.json(book) : res.status(404).json({ message: "Book not found" });
  } catch (error) { return res.status(500).json({ message: "Unable to retrieve book" }); }
});

public_users.get("/author/:author", async (req, res) => {
  try {
    const catalog = await getCatalog();
    return res.json(Object.entries(catalog).filter(([, book]) => book.author === req.params.author).map(([isbn, book]) => ({ isbn, ...book })));
  } catch (error) { return res.status(500).json({ message: "Unable to retrieve books" }); }
});

public_users.get("/title/:title", async (req, res) => {
  try {
    const catalog = await getCatalog();
    return res.json(Object.entries(catalog).filter(([, book]) => book.title === req.params.title).map(([isbn, book]) => ({ isbn, ...book })));
  } catch (error) { return res.status(500).json({ message: "Unable to retrieve books" }); }
});

public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
