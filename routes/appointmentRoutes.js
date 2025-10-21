const express = require("express");
const router = express.Router();
const { db } = require("../database.js");

function fetchDropdownData() {
  return Promise.all([
    new Promise((resolve, reject) => {
      db.all(
        "SELECT id, fullName FROM patients ORDER BY fullName ASC",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    }),
    new Promise((resolve, reject) => {
      db.all(
        "SELECT id, fullName, specialty FROM doctors ORDER BY fullName ASC",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    }),
  ]);
}

router.get("/", async (req, res) => {
  const perPage = 5;
  const requestedPage = parseInt(req.query.page, 10);
  let page =
    Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

  try {
    const countRow = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS total FROM appointments", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const total = countRow ? countRow.total : 0;
    const totalPages = total > 0 ? Math.ceil(total / perPage) : 1;
    page = Math.min(page, totalPages);
    const offset = (page - 1) * perPage;

    const appointments = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          appointments.id,
          appointments.patient_id,
          appointments.doctor_id,
          appointments.appointmentDate,
          patients.fullName AS patient_name,
          doctors.fullName AS doctor_name,
          doctors.specialty AS doctor_specialty
        FROM appointments
        INNER JOIN patients ON patients.id = appointments.patient_id
        INNER JOIN doctors ON doctors.id = appointments.doctor_id
        ORDER BY appointments.appointmentDate ASC
        LIMIT ? OFFSET ?
      `;
      db.all(sql, [perPage, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const [patientsList, doctorsList] = await fetchDropdownData();

    const buildPageUrl = (pageNumber) =>
      pageNumber === 1 ? "/appointments" : `/appointments?page=${pageNumber}`;

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

    res.render("appointments", {
      title: "Appointments",
      appointments,
      pagination,
      patientsList,
      doctorsList,
    });
  } catch (error) {
    console.error(error);
    res.render("appointments", {
      title: "Appointments",
      appointments: [],
      pagination: null,
      patientsList: [],
      doctorsList: [],
    });
  }
});

router.get("/add", (req, res) => {
  res.redirect(302, "/appointments?modal=add-appointment");
});

router.get("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/appointments");
  }
  res.redirect(302, `/appointments?modal=add-appointment&mode=edit&id=${id}`);
});

router.post("/add", (req, res) => {
  const { patient_id, doctor_id, appointmentDate } = req.body;
  const sql =
    "INSERT INTO appointments (patient_id, doctor_id, appointmentDate) VALUES (?, ?, ?)";

  db.run(sql, [patient_id, doctor_id, appointmentDate], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect("/appointments?error=add");
    }
    res.redirect("/appointments");
  });
});

router.post("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/appointments");
  }

  const { patient_id, doctor_id, appointmentDate } = req.body;
  const sql =
    "UPDATE appointments SET patient_id = ?, doctor_id = ?, appointmentDate = ? WHERE id = ?";

  db.run(sql, [patient_id, doctor_id, appointmentDate, id], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect(`/appointments?error=edit&id=${id}`);
    }
    res.redirect("/appointments");
  });
});

router.post("/:id/delete", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.redirect("/appointments");
  }

  db.run("DELETE FROM appointments WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err.message);
      return res.redirect(`/appointments?error=delete&id=${id}`);
    }
    res.redirect("/appointments");
  });
});

module.exports = router;
