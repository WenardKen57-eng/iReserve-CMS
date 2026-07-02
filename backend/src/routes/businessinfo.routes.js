const router = require("express").Router();
const ctrl = require("../controllers/businessinfo.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get("/public", ctrl.getPublic);
router.get("/", protect, authorize("admin"), ctrl.get);
router.put("/", protect, authorize("admin"), ctrl.update);

module.exports = router;
