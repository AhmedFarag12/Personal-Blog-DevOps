const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", adminController.dashboard);
router.get("/posts/new", adminController.newForm);
router.post("/posts", adminController.create);
router.get("/posts/:id/edit", adminController.editForm);
router.put("/posts/:id", adminController.update);
router.delete("/posts/:id", adminController.remove);

module.exports = router;
