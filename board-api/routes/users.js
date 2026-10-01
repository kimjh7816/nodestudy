const express = require("express");
const prisma = require("../lib/prisma");
const parseId = require("../utils/parseId");
const { success, fail } = require("../utils/response");
const { findPostPage } = require("../utils/postList");
const router = express.Router();

const USERNAME_MAX = 20;   // schema.prisma의 @db.VarChar(20)
const BIO_MAX = 150;       // schema.prisma의 @db.VarChar(150)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 응답에 내보낼 사용자 필드 (email은 본인 생성 응답 외에는 노출하지 않음)
const profileSelect = { id: true, username: true, bio: true, createdAt: true };

// req에 정보 심어주기 (4주차에는 JWT 검증 후 로그인한 사용자를 심어줍니다)
const attachUser = (req, res, next) => {
  req.user = { id: 1, name: "철수" };
  next();
};

// 내 정보 — GET /users/me  (/:id보다 위에 있어야 "me"가 id로 해석되지 않습니다)
router.get("/me", attachUser, (req, res) => {
  return res.json(success(req.user));
});

// 사용자 생성
router.post("/", async (req, res, next) => {
  try {
    const { username, email, bio } = req.body;   // 필요한 필드만

    if (typeof username !== "string" || username.trim() === "" || typeof email !== "string") {
      return res.status(400).json(fail("username과 email은 필수입니다"));
    }
    if (username.length > USERNAME_MAX) {
      return res.status(400).json(fail(`username은 ${USERNAME_MAX}자를 넘을 수 없습니다`));
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json(fail("email 형식이 올바르지 않습니다"));
    }
    if (bio !== undefined && (typeof bio !== "string" || bio.length > BIO_MAX)) {
      return res.status(400).json(fail(`bio는 ${BIO_MAX}자 이하의 문자열이어야 합니다`));
    }

    // username/email 중복은 DB의 UNIQUE 제약이 막고(P2002) 에러 핸들러가 409로 바꿉니다
    const user = await prisma.user.create({
      data: { username, email, bio },   // bio가 undefined면 스키마 기본값("")
      select: { ...profileSelect, email: true },
    });

    return res.status(201).json(success(user));
  } catch (err) {
    next(err);
  }
});

// 사용자 목록 + 글·댓글 수 — _count로 개수만 가져옵니다
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        username: true,
        _count: { select: { posts: true, comments: true } },
      },
    });

    return res.json(success(users, { count: users.length }));
  } catch (err) {
    next(err);
  }
});

// 프로필 조회 (글 수 포함) + 최근 글 5개 — 관계 안에서도 orderBy, take를 쓸 수 있습니다
router.get("/:id", async (req, res, next) => {
  try {
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

    if (!user) return res.status(404).json(fail("사용자를 찾을 수 없습니다"));

    const { _count, ...profile } = user;
    return res.json(success({ ...profile, postCount: _count.posts }));
  } catch (err) {
    next(err);
  }
});

// 특정 사용자의 글 목록 — /posts 목록과 같은 모양 (?page= &limit= &sort=)
router.get("/:id/posts", async (req, res, next) => {
  try {
    const userId = parseId(req.params.id);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return res.status(404).json(fail("사용자를 찾을 수 없습니다"));

    const { data, meta } = await findPostPage({ where: { authorId: userId }, query: req.query });

    return res.json(success(data, meta));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
