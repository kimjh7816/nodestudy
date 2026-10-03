const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const checkOwner = require("../middlewares/checkOwner");
const validate = require("../middlewares/validate");
const { commentRules } = require("../validators/comment");
const ctrl = require("../controllers/commentController");

// 댓글은 경로가 두 갈래라 전체 경로를 적고, index.js에서는 접두사 없이 붙입니다.
router.get("/posts/:id/comments", ctrl.getComments);
router.post("/posts/:id/comments", protect, commentRules, validate, ctrl.createComment);
router.delete("/comments/:id", protect, checkOwner("comment"), ctrl.deleteComment);

module.exports = router;
