const express = require("express");
const prisma = require("../lib/prisma");
const parseId = require("../utils/parseId");
const { success, fail } = require("../utils/response");
const { authorSelect } = require("../utils/postList");

// 댓글은 경로가 두 갈래라 전체 경로를 라우터 안에 적고, index.js에서는 접두사 없이 붙입니다.
//   GET/POST /posts/:id/comments  — 글에 딸린 댓글
//   DELETE   /comments/:id         — 댓글 id만으로 삭제
const router = express.Router();

const CONTENT_MAX = 500;   // schema.prisma의 @db.VarChar(500)

// 댓글 작업 전에 게시글이 있는지 먼저 확인하고, 글 id를 req.postId에 심어둡니다
const loadPost = async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return res.status(404).json(fail("게시글을 찾을 수 없습니다"));

    req.postId = postId;
    return next();
  } catch (err) {
    next(err);
  }
};

// 해당 글의 댓글 목록 (오래된 순)
router.get("/posts/:id/comments", loadPost, async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.postId },   // @@index([postId]) 덕분에 빠르게 찾습니다
      orderBy: { createdAt: "asc" },
      include: { author: authorSelect },
    });

    return res.json(success(comments, { count: comments.length }));
  } catch (err) {
    next(err);
  }
});

// 댓글 작성 — authorId는 임시로 본문에서 받습니다 (4주차에 토큰으로 교체)
router.post("/posts/:id/comments", loadPost, async (req, res, next) => {
  try {
    const { content, authorId } = req.body;

    if (typeof content !== "string" || content.trim() === "" || !authorId) {
      return res.status(400).json(fail("댓글 내용과 작성자는 필수입니다"));
    }
    if (content.length > CONTENT_MAX) {
      return res.status(400).json(fail(`댓글은 ${CONTENT_MAX}자를 넘을 수 없습니다`));
    }

    // 없는 authorId면 외래 키 위반(P2003) → 에러 핸들러에서 400
    const comment = await prisma.comment.create({
      data: { content, postId: req.postId, authorId: parseId(authorId) },
      include: { author: authorSelect },
    });

    return res.status(201).json(success(comment));
  } catch (err) {
    next(err);
  }
});

// 댓글 삭제
router.delete("/comments/:id", async (req, res, next) => {
  try {
    // 대상이 없으면 P2025 에러 → 에러 핸들러에서 404
    await prisma.comment.delete({ where: { id: parseId(req.params.id) } });

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
