const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();
app.use(express.json());
app.use("/customer", session({ secret: "fingerprint_customer", resave: false, saveUninitialized: false }));

app.use("/customer/auth/*", (req, res, next) => {
  const auth = req.session && req.session.authorization;
  if (!auth || !auth.accessToken) return res.status(401).json({ message: "Please login first" });
  try {
    const user = jwt.verify(auth.accessToken, "access");
    if (user.username !== auth.username) return res.status(401).json({ message: "Invalid session" });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
