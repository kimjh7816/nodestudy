const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { signupRules, loginRules } = require("../validators/auth");
const ctrl = require("../controllers/authController");

router.post("/signup", signupRules, validate, ctrl.signup);
router.post("/login", loginRules, validate, ctrl.login);   // index.js에서 시도 횟수 제한
router.get("/me", protect, ctrl.getMe);

module.exports = router;
