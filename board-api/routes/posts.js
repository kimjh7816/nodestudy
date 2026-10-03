const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middlewares/auth");
const checkOwner = require("../middlewares/checkOwner");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { postRules, postUpdateRules } = require("../validators/post");
const ctrl = require("../controllers/postController");

// 조회는 로그인 없이 가능 (로그인했으면 isLiked 표시)
router.get("/", optionalAuth, ctrl.getPosts);
router.get("/:id", optionalAuth, ctrl.getPost);

// upload가 postRules보다 앞 — multipart 요청은 multer가 먼저 풀어야 req.body.title이 생깁니다
router.post("/", protect, upload.array("images", 5), postRules, validate, ctrl.createPost);

// protect가 checkOwner보다 앞 — checkOwner는 req.user가 있다고 가정합니다
router.put("/:id", protect, checkOwner("post"), postRules, validate, ctrl.replacePost);
router.patch("/:id", protect, checkOwner("post"), postUpdateRules, validate, ctrl.updatePost);
router.delete("/:id", protect, checkOwner("post"), ctrl.deletePost);

router.post("/:id/like", protect, ctrl.toggleLike);

module.exports = router;
