// routes/accountRoutes.js
const express = require("express");
const { db } = require("../database.js");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// List users (admin only)
router.get("/", requireAdmin, (req, res) => {
  db.all(
    `SELECT id, username, is_admin, datetime(createdAt) as createdAt FROM users ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .render("errors/403", { title: "Error", reason: "Database error." });
      res.render("accounts/index", { title: "Accounts", users: rows });
    }
  );
});

module.exports = router;
