const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { profileRules } = require("../validators/user");
const ctrl = require("../controllers/userController");

// 사용자 생성은 POST /auth/signup 으로 옮겼습니다

router.get("/", ctrl.getUsers);

// 내 정보 조회는 GET /auth/me 입니다
// /me는 /:id보다 위에 — 아니면 "me"가 id로 해석됩니다
router.patch("/me", protect, upload.single("profileImage"), profileRules, validate, ctrl.updateMe);

router.get("/:id", ctrl.getUser);
router.get("/:id/posts", optionalAuth, ctrl.getUserPosts);

module.exports = router;
