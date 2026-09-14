const express = require("express");
const postApiController = require("../../controllers/api/postApiController");
const { requireAuthApi } = require("../../middleware/auth");

const router = express.Router();

router.get("/", postApiController.list);
router.get("/:slug", postApiController.show);
router.post("/", requireAuthApi, postApiController.create);
router.put("/:id", requireAuthApi, postApiController.update);
router.delete("/:id", requireAuthApi, postApiController.remove);

module.exports = router;
