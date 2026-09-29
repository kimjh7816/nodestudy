const express = require("express");
const store = require("../data/store");
const { success, fail, httpError } = require("../utils/response");

// mergeParams: true — index.js에서 붙인 경로의 :postId를 이 라우터에서도 읽을 수 있게 합니다.
// 이게 없으면 req.params.postId가 undefined 입니다.
const router = express.Router({ mergeParams: true });

// 댓글 작업 전에 게시글이 있는지 먼저 확인하고, 찾은 글을 req.post에 심어둡니다
const loadPost = (req, res, next) => {
  const post = store.findPostById(Number(req.params.postId));
  if (!post) return next(httpError(404, "게시글을 찾을 수 없습니다"));

  req.post = post;
  return next();
};

router.use(loadPost);

// 여기서의 "/"는 실제로 /posts/:postId/comments 입니다.

// 해당 글의 댓글 목록
router.get("/", (req, res) => {
  const comments = store.findCommentsByPostId(req.post.id);
  return res.json(success(comments, { count: comments.length }));
});

// 댓글 작성
router.post("/", (req, res) => {
  const { content, author } = req.body;

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json(fail("댓글 내용은 필수입니다"));
  }

  const comment = store.createComment({ postId: req.post.id, content, author: author || "익명" });
  return res.status(201).json(success(comment));
});

// 댓글 삭제
router.delete("/:commentId", (req, res, next) => {
  const removed = store.removeComment(req.post.id, Number(req.params.commentId));
  if (!removed) return next(httpError(404, "댓글을 찾을 수 없습니다"));

  return res.status(204).end();
});

module.exports = router;
