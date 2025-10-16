const express = require("express");
const bcrypt = require("bcrypt");
const { db } = require("../database.js");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.session?.loggedIn) return res.redirect("/");
  res.render("auth/login", { title: "Login" });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).render("auth/login", {
      title: "Login",
      error: "Please enter both username and password.",
    });
  }

  const sql = `SELECT id, username, passwordHash FROM users WHERE username = ?`;
  db.get(sql, [username], async (err, user) => {
    if (err) {
      console.error("DB error:", err.message);
      return res.status(500).render("auth/login", {
        title: "Login",
        error: "Internal error. Please try again.",
      });
    }

    console.log("User", user);

    if (!user) {
      return res.status(401).render("auth/login", {
        title: "Login",
        error: "Invalid username or password.",
      });
    }

    try {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).render("auth/login", {
          title: "Login",
          error: "Invalid username or password.",
        });
      }

      // Success: set session flags
      req.session.loggedIn = true;
      req.session.userId = user.id;
      req.session.username = user.username;

      // Important for some session stores: ensure save completes before redirect
      req.session.save(() => res.redirect("/"));
    } catch (e) {
      console.error("bcrypt error:", e);
      return res.status(500).render("auth/login", {
        title: "Login",
        error: "Internal error. Please try again.",
      });
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.redirect("/");
  });
});

module.exports = router;
