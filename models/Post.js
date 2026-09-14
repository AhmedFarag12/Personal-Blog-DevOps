const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

postSchema.pre("validate", async function generateSlug(next) {
  if (!this.isModified("title")) return next();

  const base = slugify(this.title, { lower: true, strict: true });
  let candidate = base;
  let suffix = 1;

  while (await mongoose.models.Post.exists({ slug: candidate, _id: { $ne: this._id } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model("Post", postSchema);
