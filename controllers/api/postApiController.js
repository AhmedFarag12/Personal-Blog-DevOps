const postService = require("../../services/postService");

async function list(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const { posts, pagination } = await postService.getPublishedPostsPaginated({
    tag: req.query.tag,
    page,
    limit,
  });

  res.json({ posts, pagination });
}

async function show(req, res) {
  const post = await postService.getPublishedPostBySlug(req.params.slug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ post });
}

async function create(req, res) {
  try {
    const post = await postService.createPost(req.body, req.session.userId);
    res.status(201).json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const post = await postService.updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function remove(req, res) {
  const post = await postService.deletePost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.status(204).end();
}

module.exports = { list, show, create, update, remove };
