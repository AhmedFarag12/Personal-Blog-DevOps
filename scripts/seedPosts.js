require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Post = require("../models/Post");
const postService = require("../services/postService");

const samplePosts = [
  {
    title: "Welcome to My Blog",
    excerpt: "A quick introduction to this blog and what you can expect to find here.",
    content:
      "<p>Hello and welcome! This is the first post on this blog. Here I'll be sharing thoughts on software development, personal projects, and things I'm learning along the way.</p><p>Stick around — more posts are coming soon.</p>",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200",
    tags: ["welcome", "intro"],
    published: true,
  },
  {
    title: "Getting Started with Node.js and Express",
    excerpt: "A beginner-friendly walkthrough of building your first web server with Express.",
    content:
      "<p>Express is a minimal and flexible Node.js web framework that makes building web apps and APIs straightforward.</p><p>In this post we cover routing, middleware, and how to structure a small project.</p><pre><code>const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('Hello World!'));\n\napp.listen(3000);</code></pre>",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
    tags: ["nodejs", "express", "tutorial"],
    published: true,
  },
  {
    title: "Why I Chose MongoDB for This Project",
    excerpt: "A look at the tradeoffs between SQL and NoSQL databases for a small blog app.",
    content:
      "<p>MongoDB's flexible, document-based schema made it a natural fit for storing blog posts with varying fields like tags and cover images.</p><p>Combined with Mongoose, it's easy to add validation and structure while keeping things simple.</p>",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200",
    tags: ["mongodb", "database"],
    published: true,
  },
  {
    title: "Draft: Thoughts on Personal Projects",
    excerpt: "An unfinished post about staying motivated with side projects.",
    content: "<p>This one is still a work in progress...</p>",
    tags: ["personal"],
    published: false,
  },
];

async function main() {
  await connectDB();

  const admin = await User.findOne().sort({ createdAt: 1 });
  if (!admin) {
    console.error("No admin user found. Run `npm run seed:admin` first.");
    process.exit(1);
  }

  for (const data of samplePosts) {
    const existing = await Post.findOne({ title: data.title });
    if (existing) {
      console.log(`Skipping (already exists): ${data.title}`);
      continue;
    }
    const post = await postService.createPost(data, admin._id);
    console.log(`Created: ${post.title}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
