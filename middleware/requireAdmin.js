module.exports = function requireAdmin(req, res, next) {
  if (req.session?.loggedIn && req.session?.is_admin) return next();
  // Optionally flash a message here
  return res
    .status(403)
    .render("errors/403", {
      title: "Forbidden",
      reason: "Admin access required.",
    });
};
