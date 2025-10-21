const express = require("express");
const { db } = require("../database.js");
const requireAdmin = require("../middleware/requireAdmin");

let bcrypt;
try {
  bcrypt = require("bcrypt");
} catch {
  bcrypt = require("bcryptjs");
}

const router = express.Router();
const PER_PAGE = 5;
const SALT_ROUNDS = 12;

router.use(requireAdmin);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function ensureAnotherAdmin(excludeId) {
  const row = await get(
    `SELECT COUNT(*) AS total FROM users WHERE is_admin = 1 AND id != ?`,
    [excludeId]
  );
  return row.total > 0;
}

function buildPagination(base, page, totalPages) {
  if (totalPages <= 1) return null;
  const buildUrl = (n) => (n === 1 ? base : `${base}?page=${n}`);
  return {
    prev: page > 1 ? buildUrl(page - 1) : null,
    next: page < totalPages ? buildUrl(page + 1) : null,
    pages: Array.from({ length: totalPages }, (_, idx) => {
      const n = idx + 1;
      return {
        n,
        url: buildUrl(n),
        active: n === page,
      };
    }),
  };
}

async function renderAccounts(req, res) {
  const requestedPage = parseInt(req.query.page, 10);
  let page = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

  try {
    const { total } = await get(`SELECT COUNT(*) AS total FROM users`);
    const totalPages = total > 0 ? Math.ceil(total / PER_PAGE) : 1;
    page = Math.min(page, totalPages);
    const offset = (page - 1) * PER_PAGE;

    const users = await all(
      `SELECT id, username, is_admin, createdAt FROM users ORDER BY id ASC LIMIT ? OFFSET ?`,
      [PER_PAGE, offset]
    );

    res.render("accounts/index", {
      title: "Accounts",
      users,
      pagination: buildPagination("/accounts", page, totalPages),
      selfId: req.session.userId,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.render("accounts/index", {
      title: "Accounts",
      users: [],
      pagination: null,
      selfId: req.session.userId,
      query: req.query,
      error: "Unable to load accounts.",
    });
  }
}

router.get("/", renderAccounts);

router.get("/add", (req, res) => {
  res.redirect("/accounts?modal=add-account");
});

router.get("/:id/edit", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.redirect("/accounts");
  res.redirect(`/accounts?modal=add-account&mode=edit&id=${id}`);
});

router.post("/add", async (req, res) => {
  const { username = "", password = "", confirmPassword = "", is_admin = "0" } =
    req.body || {};
  const trimmed = username.trim();
  const adminFlag = is_admin === "1" ? 1 : 0;

  if (trimmed.length < 3 || password.length < 6 || password !== confirmPassword) {
    return res.redirect("/accounts?error=invalid");
  }

  try {
    const existing = await get(
      `SELECT id FROM users WHERE lower(username) = lower(?)`,
      [trimmed]
    );
    if (existing) {
      return res.redirect("/accounts?error=exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await run(
      `INSERT INTO users (username, passwordHash, is_admin, createdAt) VALUES (?, ?, ?, datetime('now'))`,
      [trimmed, passwordHash, adminFlag]
    );
    res.redirect("/accounts?success=created");
  } catch (error) {
    console.error(error);
    res.redirect("/accounts?error=add");
  }
});

router.post("/:id/edit", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.redirect("/accounts");

  const {
    username = "",
    password = "",
    confirmPassword = "",
    is_admin = "0",
  } = req.body || {};

  const trimmed = username.trim();
  const adminFlag = is_admin === "1" ? 1 : 0;
  const isSelf = req.session.userId === id;

  if (trimmed.length < 3) {
    return res.redirect("/accounts?error=invalid");
  }

  if (isSelf && adminFlag === 0) {
    return res.redirect("/accounts?error=self-demote");
  }

  if (password && password.length < 6) {
    return res.redirect("/accounts?error=short-pass");
  }
  if (password && password !== confirmPassword) {
    return res.redirect("/accounts?error=pass-mismatch");
  }

  try {
    const user = await get(`SELECT id, is_admin FROM users WHERE id = ?`, [id]);
    if (!user) return res.redirect("/accounts?error=missing");

    const duplicate = await get(
      `SELECT id FROM users WHERE lower(username) = lower(?) AND id != ?`,
      [trimmed, id]
    );
    if (duplicate) {
      return res.redirect("/accounts?error=exists");
    }

    if (!adminFlag && user.is_admin) {
      const ok = await ensureAnotherAdmin(id);
      if (!ok) {
        return res.redirect("/accounts?error=last-admin");
      }
    }

    const updates = [`username = ?`, `is_admin = ?`];
    const params = [trimmed, adminFlag];

    if (password) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push(`passwordHash = ?`);
      params.push(passwordHash);
    }

    params.push(id);

    await run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);

    if (isSelf) {
      req.session.username = trimmed;
      req.session.is_admin = !!adminFlag;
    }

    res.redirect("/accounts?success=updated");
  } catch (error) {
    console.error(error);
    res.redirect("/accounts?error=edit");
  }
});

router.post("/:id/delete", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.redirect("/accounts");

  if (req.session.userId === id) {
    return res.redirect("/accounts?error=self-delete");
  }

  try {
    const user = await get(`SELECT id, is_admin FROM users WHERE id = ?`, [id]);
    if (!user) return res.redirect("/accounts?error=missing");

    if (user.is_admin) {
      const ok = await ensureAnotherAdmin(id);
      if (!ok) {
        return res.redirect("/accounts?error=last-admin");
      }
    }

    await run(`DELETE FROM users WHERE id = ?`, [id]);
    res.redirect("/accounts?success=deleted");
  } catch (error) {
    console.error(error);
    res.redirect("/accounts?error=delete");
  }
});

module.exports = router;
