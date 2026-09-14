const authService = require("../services/authService");

function loginForm(req, res) {
  if (req.session.userId) return res.redirect("/admin");
  res.render("login", { title: "Login", error: null });
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = await authService.verifyCredentials(username, password);

  if (!user) {
    return res.status(401).render("login", { title: "Login", error: "Invalid username or password" });
  }

  req.session.regenerate((err) => {
    if (err) throw err;
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    const returnTo = req.session.returnTo || "/admin";
    delete req.session.returnTo;
    res.redirect(returnTo);
  });
}

function logout(req, res) {
  req.session.destroy(() => res.redirect("/"));
}

module.exports = { loginForm, login, logout };
