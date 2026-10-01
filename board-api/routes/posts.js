const express = require("express");
const prisma = require("../lib/prisma");
const parseId = require("../utils/parseId");
const { success, fail } = require("../utils/response");
const {
  CURRENT_USER_ID,
  authorSelect,
  tagsSelect,
  toTagNames,
  toPostItem,
  findPostPage,
} = require("../utils/postList");

const router = express.Router();

const TITLE_MAX = 100;
const TAG_MAX = 30;        // schema.prisma의 Tag.name @db.VarChar(30)
const TAGS_PER_POST = 10;

// 태그 검증. ["여행", " 제주 ", "여행"] → { names: ["여행", "제주"] } (앞뒤 공백 제거, 중복 제거)
// 문제가 있으면 { error: "메시지" }
const parseTags = (tags) => {
  if (!Array.isArray(tags)) return { error: "tags는 문자열 배열이어야 합니다" };

  const names = [];
  for (const tag of tags) {
    if (typeof tag !== "string" || tag.trim() === "") return { error: "태그는 비어 있을 수 없습니다" };
    const name = tag.trim();
    if (name.length > TAG_MAX) return { error: `태그는 ${TAG_MAX}자를 넘을 수 없습니다` };
    if (!names.includes(name)) names.push(name);
  }
  if (names.length > TAGS_PER_POST) return { error: `태그는 ${TAGS_PER_POST}개까지 붙일 수 있습니다` };

  return { names };
};

// 태그 이름으로 연결 — 이미 있는 태그면 연결만, 없으면 새로 만들어서 연결 (암시적 N:M)
const connectTags = (names) => ({
  connectOrCreate: names.map((name) => ({ where: { name }, create: { name } })),
});

// 작성/수정 응답: 태그를 이름 배열로
const withTagNames = ({ tags, ...post }) => ({ ...post, tags: toTagNames(tags) });

// 제목/내용 검증. 문제가 있으면 에러 메시지, 없으면 null
// partial: true 이면 PATCH용 — 보낸 필드만 검사합니다
const validatePost = ({ title, content }, { partial = false } = {}) => {
  if (!partial && (!title || !content)) return "제목과 내용은 필수입니다";
  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return "제목은 비어 있을 수 없습니다";
  }
  if (content !== undefined && (typeof content !== "string" || content.trim() === "")) {
    return "내용은 비어 있을 수 없습니다";
  }
  if (title !== undefined && title.length > TITLE_MAX) {
    return `제목은 ${TITLE_MAX}자를 넘을 수 없습니다`;
  }
  return null;
};

// 여기서는 "/posts"를 안 씁니다. index.js에서 붙일 겁니다.

// 목록 조회 — ?authorId= &author=(username) &search= &tag= &sort=latest|oldest|popular &page= &limit=
router.get("/", async (req, res, next) => {
  try {
    const { authorId, author, search, tag } = req.query;

    // 필터 조건 조립 (값이 없으면 키를 아예 넣지 않음)
    const where = {};
    if (authorId) where.authorId = parseId(authorId);
    if (author) where.author = { username: author };   // 관계 필드로 작성자 이름 필터
    if (tag) where.tags = { some: { name: tag } };      // N:M — 이 태그가 하나라도 붙은 글
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // 정렬·페이지·관계 포함은 utils/postList.js 에서 공통 처리
    const { data, meta } = await findPostPage({ where, query: req.query });

    return res.json(success(data, meta));
  } catch (err) {
    next(err);
  }
});

// 단건 조회 — 게시글 + 작성자 + 댓글(+ 댓글 작성자) + 개수를 한 번에
router.get("/:id", async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseId(req.params.id) },
      include: {
        author: authorSelect,
        tags: tagsSelect,
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: authorSelect },
        },
        _count: { select: { comments: true, likes: true } },
        likes: { where: { userId: CURRENT_USER_ID }, select: { userId: true } },
      },
    });

    // findUnique는 못 찾으면 에러가 아니라 null을 돌려줍니다
    if (!post) return res.status(404).json(fail("게시글을 찾을 수 없습니다"));

    return res.json(success(toPostItem(post)));
  } catch (err) {
    next(err);
  }
});

// 생성 — authorId는 임시로 본문에서 받습니다 (4주차에 로그인 토큰에서 꺼내도록 변경)
router.post("/", async (req, res, next) => {
  try {
    const { title, content, authorId, tags = [] } = req.body;   // req.body를 통째로 넘기지 않고 필요한 필드만

    if (!title || !content || !authorId) {
      return res.status(400).json(fail("제목, 내용, 작성자는 필수입니다"));
    }
    const error = validatePost({ title, content });
    if (error) return res.status(400).json(fail(error));

    const { names, error: tagError } = parseTags(tags);
    if (tagError) return res.status(400).json(fail(tagError));

    // 없는 authorId면 외래 키 위반(P2003) → 에러 핸들러에서 400
    const post = await prisma.post.create({
      data: { title, content, authorId: parseId(authorId), tags: connectTags(names) },
      include: { tags: tagsSelect },
    });

    return res.status(201).json(success(withTagNames(post)));
  } catch (err) {
    next(err);
  }
});

// PUT vs PATCH
// - PUT   : 수정 가능한 필드(title, content, tags) "전체"를 교체합니다. title, content는 필수이고
//           tags를 안 보내면 태그가 모두 떼어집니다. (안 보낸 필드 = 비우겠다는 뜻)
// - PATCH : 보낸 필드"만" 바꿉니다. 안 보낸 필드는 그대로 유지됩니다.

// 전체 수정
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { title, content, tags = [] } = req.body;

    const error = validatePost({ title, content });
    if (error) return res.status(400).json(fail(error));

    const { names, error: tagError } = parseTags(tags);
    if (tagError) return res.status(400).json(fail(tagError));

    // update는 대상이 없으면 null이 아니라 P2025 에러 → 에러 핸들러에서 404
    const post = await prisma.post.update({
      where: { id },
      data: { title, content, tags: { set: [], ...connectTags(names) } },   // 기존 연결을 끊고 새로 연결
      include: { tags: tagsSelect },
    });

    return res.json(success(withTagNames(post)));
  } catch (err) {
    next(err);
  }
});

// 부분 수정
router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { title, content, tags } = req.body;

    const error = validatePost({ title, content }, { partial: true });
    if (error) return res.status(400).json(fail(error));

    // tags를 보냈을 때만 태그를 교체합니다 (안 보내면 그대로)
    let tagsUpdate;
    if (tags !== undefined) {
      const { names, error: tagError } = parseTags(tags);
      if (tagError) return res.status(400).json(fail(tagError));
      tagsUpdate = { set: [], ...connectTags(names) };
    }

    // data에서 undefined인 필드는 Prisma가 무시합니다
    const post = await prisma.post.update({
      where: { id },
      data: { title, content, tags: tagsUpdate },
      include: { tags: tagsSelect },
    });

    return res.json(success(withTagNames(post)));
  } catch (err) {
    next(err);
  }
});

// 삭제 — 댓글·좋아요는 onDelete: Cascade로 DB가 함께 지웁니다
router.delete("/:id", async (req, res, next) => {
  try {
    // 대상이 없으면 P2025 에러 → 에러 핸들러에서 404
    await prisma.post.delete({ where: { id: parseId(req.params.id) } });

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// 좋아요 토글 — 누르면 추가, 다시 누르면 취소
router.post("/:id/like", async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    const userId = parseId(req.body.userId);   // 4주차에 토큰으로 교체

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return res.status(404).json(fail("게시글을 찾을 수 없습니다"));

    // 복합 키(@@id([userId, postId]))로 찾을 때는 Prisma가 만든 userId_postId 이름을 씁니다
    const where = { userId_postId: { userId, postId } };
    const existing = await prisma.like.findUnique({ where });

    if (existing) {
      await prisma.like.delete({ where });
    } else {
      await prisma.like.create({ data: { userId, postId } });   // 없는 userId면 P2003 → 400
    }

    // 좋아요 수는 숫자 열로 따로 두지 않고 중간 테이블의 행 개수를 셉니다
    const likeCount = await prisma.like.count({ where: { postId } });

    return res.json(success({ liked: !existing, likeCount }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
