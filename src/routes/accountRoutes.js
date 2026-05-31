const express = require("express");
const accountController = require("../controllers/accountController");
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { depositSchema } = require("../validations/schemas");

const router = express.Router();

// All account routes require a valid JWT
router.use(authenticate);

router.get("/balance", accountController.getBalance);
router.post("/deposit", validate(depositSchema), accountController.deposit);

module.exports = router;
