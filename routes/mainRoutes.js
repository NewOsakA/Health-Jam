const express = require("express");
const router = express.Router();
const { db } = require("../database.js");

function getCount(sql) {
  return new Promise((resolve) => {
    db.get(sql, (err, row) => {
      if (err) {
        console.error("Count query failed:", err.message);
        resolve(0);
      } else {
        resolve(row?.total || 0);
      }
    });
  });
}

// Home page route
router.get("/", async (req, res) => {
  const [patients, doctors, appointments] = await Promise.all([
    getCount("SELECT COUNT(*) AS total FROM patients"),
    getCount("SELECT COUNT(*) AS total FROM doctors"),
    getCount("SELECT COUNT(*) AS total FROM appointments"),
  ]);

  res.render("home", {
    title: "Health Jam Clinic",
    stats: [
      { label: "Active patients", value: patients },
      { label: "Registered doctors", value: doctors },
      { label: "Upcoming appointments", value: appointments },
    ],
  });
});

router.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

router.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact" });
});

module.exports = router;
