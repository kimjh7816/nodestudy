const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");
const { success } = require("../utils/response");
const { removeUploadByUrl } = require("../utils/files");
const { findPostPage } = require("../utils/postList");

// 다른 사람에게 보여줄 프로필 필드 (email은 본인에게만)
const profileSelect = { id: true, username: true, bio: true, profileImage: true, createdAt: true };

// 사용자 목록 + 글·댓글 수 — _count로 개수만 가져옵니다
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      username: true,
      profileImage: true,
      _count: { select: { posts: true, comments: true } },
    },
  });

  res.json(success(users, { count: users.length }));
});

// 내 프로필 수정 — URL의 id가 아니라 토큰의 id를 씁니다 (남의 프로필 수정 방지)
exports.updateMe = asyncHandler(async (req, res) => {
  const { bio } = req.body;
  const data = {};

  if (bio !== undefined) data.bio = bio;
  if (req.file) data.profileImage = `/uploads/${req.file.filename}`;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
  });

  // 프로필 사진을 바꿨으면 예전 파일은 지웁니다
  if (req.file) removeUploadByUrl(req.user.profileImage);

  res.json(success(user));
});

// 프로필 조회 (글 수 포함) + 최근 글 5개 — 관계 안에서도 orderBy, take를 쓸 수 있습니다
exports.getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseId(req.params.id) },
    select: {
      ...profileSelect,
      posts: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      },
      _count: { select: { posts: true } },
    },
  });

  if (!user) throw new AppError("사용자를 찾을 수 없습니다", 404);

  const { _count, ...profile } = user;
  res.json(success({ ...profile, postCount: _count.posts }));
});

// 특정 사용자의 글 목록 — /posts 목록과 같은 모양 (?page= &limit= &sort=)
exports.getUserPosts = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.id);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new AppError("사용자를 찾을 수 없습니다", 404);

  const { data, meta } = await findPostPage({
    where: { authorId: userId },
    query: req.query,
    userId: req.user?.id,
  });

  res.json(success(data, meta));
});
