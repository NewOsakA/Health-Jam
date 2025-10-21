module.exports = function requireLogin(req, res, next) {
  if (req.session?.loggedIn) return next();
  return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl || "/")}`);
};
