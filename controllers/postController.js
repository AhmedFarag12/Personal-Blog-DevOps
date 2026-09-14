const postService = require("../services/postService");

async function index(req, res) {
  const posts = await postService.getPublishedPosts();
  res.render("index", { title: "Home", posts });
}

async function show(req, res) {
  const post = await postService.getPublishedPostBySlug(req.params.slug);
  if (!post) return res.status(404).render("404", { title: "Not found" });
  res.render("show", { title: post.title, post });
}

module.exports = { index, show };
