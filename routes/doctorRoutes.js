const express = require("express");
const router = express.Router();
const { db } = require("../database.js");

router.get("/", (req, res) => {
  const perPage = 5;
  const requestedPage = parseInt(req.query.page, 10);
  let page =
    Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

  db.get("SELECT COUNT(*) AS total FROM doctors", (countErr, countRow) => {
    if (countErr) {
      console.error(countErr.message);
      return res.render("doctors", {
        title: "Doctors",
        doctors: [],
        pagination: null,
      });
    }

    const total = countRow ? countRow.total : 0;
    const totalPages = total > 0 ? Math.ceil(total / perPage) : 1;
    page = Math.min(page, totalPages);
    const offset = (page - 1) * perPage;

    db.all(
      "SELECT * FROM doctors ORDER BY id ASC LIMIT ? OFFSET ?",
      [perPage, offset],
      (err, rows) => {
        if (err) {
          console.error(err.message);
          return res.render("doctors", {
            title: "Doctors",
            doctors: [],
            pagination: null,
          });
        }

        const buildPageUrl = (pageNumber) =>
          pageNumber === 1 ? "/doctors" : `/doctors?page=${pageNumber}`;

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

        res.render("doctors", {
          title: "Doctors",
          doctors: rows,
          pagination,
        });
      }
    );
  });
});

router.get("/add", (req, res) => {
  res.redirect(302, "/doctors?modal=add-doctor");
});

router.get("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/doctors");
  }
  res.redirect(302, `/doctors?modal=add-doctor&mode=edit&id=${id}`);
});

router.post("/add", (req, res) => {
  const { fullName, specialty } = req.body;
  const sql =
    "INSERT INTO doctors (fullName, specialty) VALUES (?, ?)";

  db.run(sql, [fullName, specialty], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect("/doctors?error=add");
    }
    res.redirect("/doctors");
  });
});

router.post("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/doctors");
  }

  const { fullName, specialty } = req.body;
  const sql =
    "UPDATE doctors SET fullName = ?, specialty = ? WHERE id = ?";

  db.run(sql, [fullName, specialty, id], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect(`/doctors?error=edit&id=${id}`);
    }
    res.redirect("/doctors");
  });
});

router.post("/:id/delete", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/doctors");
  }

  db.run("DELETE FROM doctors WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect(`/doctors?error=delete&id=${id}`);
    }
    res.redirect("/doctors");
  });
});

module.exports = router;
