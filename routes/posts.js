const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

router.get("/", postController.index);
router.get("/posts/:slug", postController.show);

module.exports = router;
