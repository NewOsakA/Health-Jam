module.exports = function requireAdmin(req, res, next) {
  if (!req.session?.loggedIn) {
    return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl || "/")}`);
  }

  if (req.session.is_admin) return next();

  return res
    .status(403)
    .render("errors/403", {
      title: "Forbidden",
      reason: "Admin access required.",
    });
};
