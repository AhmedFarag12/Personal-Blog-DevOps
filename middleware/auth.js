function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect("/login");
}

function requireAuthApi(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: "Authentication required" });
}

function attachUser(req, res, next) {
  res.locals.currentUser = req.session.username || null;
  next();
}

module.exports = { requireAuth, requireAuthApi, attachUser };
