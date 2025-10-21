const express = require("express");
const router = express.Router();
const { db } = require("../database.js");

// Patients list route
router.get("/", (req, res) => {
  const perPage = 5;
  const requestedPage = parseInt(req.query.page, 10);
  let page = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

  db.get("SELECT COUNT(*) AS total FROM patients", (countErr, countRow) => {
    if (countErr) {
      console.error(countErr.message);
      return res.render("patients/patients", {
        title: "Patient List",
        patients: [],
        pagination: null,
      });
    }

    const total = countRow ? countRow.total : 0;
    const totalPages = total > 0 ? Math.ceil(total / perPage) : 1;
    page = Math.min(page, totalPages);
    const offset = (page - 1) * perPage;

    db.all(
      "SELECT * FROM patients ORDER BY id ASC LIMIT ? OFFSET ?",
      [perPage, offset],
      (err, rows) => {
        if (err) {
          console.error(err.message);
          return res.render("patients/patients", {
            title: "Patient List",
            patients: [],
            pagination: null,
          });
        }

        const buildPageUrl = (pageNumber) =>
          pageNumber === 1 ? "/patients" : `/patients?page=${pageNumber}`;

        const pagination =
          totalPages > 1
            ? {
                prev: page > 1 ? buildPageUrl(page - 1) : null,
                next: page < totalPages ? buildPageUrl(page + 1) : null,
                pages: Array.from({ length: totalPages }, (_, idx) => {
                  const pageNumber = idx + 1;
                  return {
                    n: pageNumber,
                    url: buildPageUrl(pageNumber),
                    active: pageNumber === page,
                  };
                }),
              }
            : null;

        res.render("patients/patients", {
          title: "Patient List",
          patients: rows,
          pagination,
        });
      }
    );
  });
});

// GET route to display the "Add Patient" form
router.get("/add", (req, res) => {
  res.redirect(302, "/patients?modal=add-patient");
});

// GET route to open edit modal via direct link
router.get("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/patients");
  }
  res.redirect(302, `/patients?modal=add-patient&mode=edit&id=${id}`);
});

// POST route to handle add form submission
router.post("/add", (req, res) => {
  const { fullName, birthDate, illness } = req.body;
  const sql =
    "INSERT INTO patients (fullName, birthDate, illness) VALUES (?, ?, ?)";

  db.run(sql, [fullName, birthDate, illness], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect("/patients?error=add");
    }
    // Redirect back to the patient list page after adding
    res.redirect("/patients");
  });
});

// POST route to handle edit submission
router.post("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/patients");
  }
  const { fullName, birthDate, illness } = req.body;
  const sql =
    "UPDATE patients SET fullName = ?, birthDate = ?, illness = ? WHERE id = ?";

  db.run(sql, [fullName, birthDate, illness, id], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect(`/patients?error=edit&id=${id}`);
    }
    res.redirect("/patients");
  });
});

// POST route to delete a patient
router.post("/:id/delete", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/patients");
  }

  db.run("DELETE FROM patients WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect(`/patients?error=delete&id=${id}`);
    }
    res.redirect("/patients");
  });
});

module.exports = router;
