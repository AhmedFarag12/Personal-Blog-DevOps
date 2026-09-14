const Post = require("../models/Post");

function parseTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === "string") return tags.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

function getPublishedPosts({ tag } = {}) {
  const filter = { published: true };
  if (tag) filter.tags = tag;
  return Post.find(filter).sort({ createdAt: -1 }).populate("author", "username");
}

async function getPublishedPostsPaginated({ tag, page = 1, limit = 10 } = {}) {
  const filter = { published: true };
  if (tag) filter.tags = tag;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username"),
    Post.countDocuments(filter),
  ]);

  return { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

function getPublishedPostBySlug(slug) {
  return Post.findOne({ slug, published: true }).populate("author", "username");
}

function getAllPosts() {
  return Post.find().sort({ createdAt: -1 });
}

function getPostById(id) {
  return Post.findById(id);
}

function createPost(data, authorId) {
  const post = new Post({
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage,
    tags: parseTags(data.tags),
    published: data.published === undefined ? true : Boolean(data.published),
    author: authorId,
  });
  return post.save();
}

async function updatePost(id, data) {
  const post = await Post.findById(id);
  if (!post) return null;

  if (data.title !== undefined) post.title = data.title;
  if (data.excerpt !== undefined) post.excerpt = data.excerpt;
  if (data.content !== undefined) post.content = data.content;
  if (data.coverImage !== undefined) post.coverImage = data.coverImage;
  if (data.tags !== undefined) post.tags = parseTags(data.tags);
  if (data.published !== undefined) post.published = Boolean(data.published);

  return post.save();
}

function deletePost(id) {
  return Post.findByIdAndDelete(id);
}

module.exports = {
  getPublishedPosts,
  getPublishedPostsPaginated,
  getPublishedPostBySlug,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
