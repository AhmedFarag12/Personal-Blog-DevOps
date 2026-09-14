const postService = require("../services/postService");

async function dashboard(req, res) {
  const posts = await postService.getAllPosts();
  res.render("admin/dashboard", { title: "Dashboard", posts });
}

function newForm(req, res) {
  res.render("admin/form", { title: "New Post", post: null });
}

async function create(req, res) {
  const { title, excerpt, content, coverImage, tags, published } = req.body;
  await postService.createPost(
    { title, excerpt, content, coverImage, tags, published: published === "on" },
    req.session.userId
  );
  res.redirect("/admin");
}

async function editForm(req, res) {
  const post = await postService.getPostById(req.params.id);
  if (!post) return res.status(404).render("404", { title: "Not found" });
  res.render("admin/form", { title: "Edit Post", post });
}

async function update(req, res) {
  const { title, excerpt, content, coverImage, tags, published } = req.body;
  const post = await postService.updatePost(req.params.id, {
    title,
    excerpt,
    content,
    coverImage,
    tags,
    published: published === "on",
  });
  if (!post) return res.status(404).render("404", { title: "Not found" });
  res.redirect("/admin");
}

async function remove(req, res) {
  await postService.deletePost(req.params.id);
  res.redirect("/admin");
}

module.exports = { dashboard, newForm, create, editForm, update, remove };
