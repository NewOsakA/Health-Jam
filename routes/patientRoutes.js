const express = require("express");
const router = express.Router();
const { db } = require("../database.js");

// Patients list route
router.get("/", (req, res) => {
  const sql = "SELECT * FROM patients ORDER BY fullName";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("patients/patients", {
      title: "Patient List",
      patients: rows,
    });
  });
});

// GET route to display the "Add Patient" form
router.get("/add", (req, res) => {
  res.render("patients/addPatients", { title: "Add New Patient" });
});

// POST route to handle the form submission
router.post("/add", (req, res) => {
  const { fullName, birthDate, illness } = req.body;
  const sql =
    "INSERT INTO patients (fullName, birthDate, illness) VALUES (?, ?, ?)";

  db.run(sql, [fullName, birthDate, illness], (err) => {
    if (err) {
      return console.error(err.message);
    }
    // Redirect back to the patient list page after adding
    res.redirect("/patients");
  });
});

module.exports = router;
