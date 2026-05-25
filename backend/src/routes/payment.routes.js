const router = require("express").Router();
const ctrl = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { paymentSchema } = require("../validations/payment.validation");

router.post("/", protect, authorize("admin", "manager"), validate(paymentSchema), ctrl.create);
router.post("/checkout", protect, ctrl.createCheckout);
router.post("/webhook", ctrl.handleWebhook);
router.get("/", protect, authorize("admin", "manager"), ctrl.getAll);
router.get("/me", protect, ctrl.getMine);
router.get("/:id", protect, ctrl.getById);
router.put("/:id", protect, authorize("admin", "manager"), ctrl.update);
router.delete("/:id", protect, authorize("admin"), ctrl.remove);

module.exports = router;