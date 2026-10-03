const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");
const { success } = require("../utils/response");
const { authorSelect } = require("../utils/postList");

// 게시글이 있는지 확인하고 id를 돌려줍니다 (없으면 404)
const findPostId = async (rawId) => {
  const post = await prisma.post.findUnique({ where: { id: parseId(rawId) }, select: { id: true } });
  if (!post) throw new AppError("게시글을 찾을 수 없습니다", 404);
  return post.id;
};

// 해당 글의 댓글 목록 (오래된 순)
exports.getComments = asyncHandler(async (req, res) => {
  const postId = await findPostId(req.params.id);

  const comments = await prisma.comment.findMany({
    where: { postId },   // @@index([postId]) 덕분에 빠르게 찾습니다
    orderBy: { createdAt: "asc" },
    include: { author: authorSelect },
  });

  res.json(success(comments, { count: comments.length }));
});

// 댓글 작성 — 작성자는 토큰의 사용자
exports.createComment = asyncHandler(async (req, res) => {
  const postId = await findPostId(req.params.id);

  const comment = await prisma.comment.create({
    data: { content: req.body.content, postId, authorId: req.user.id },
    include: { author: authorSelect },
  });

  res.status(201).json(success(comment));
});

// 댓글 삭제 — checkOwner("comment")가 존재 여부(404)와 소유권(403)을 이미 확인했습니다
exports.deleteComment = asyncHandler(async (req, res) => {
  await prisma.comment.delete({ where: { id: req.doc.id } });
  res.status(204).end();
});
