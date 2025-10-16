const express = require("express");
const router = express.Router();
const { db } = require("../database.js");

// Home page route
router.get("/", (req, res) => {
  res.render("home", { title: "Health Jam Clinic" });
});

router.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

router.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact" });
});

module.exports = router;
