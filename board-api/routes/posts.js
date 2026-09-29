const express = require("express");
const store = require("../data/store");
const { success, fail, httpError } = require("../utils/response");

const router = express.Router();

const TITLE_MAX = 100;
const SORTS = ["latest", "oldest"];

const postNotFound = () => httpError(404, "게시글을 찾을 수 없습니다");

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

// 목록 조회 — ?author= &search= &sort=latest|oldest &page= &limit=
router.get("/", (req, res) => {
  const { author, search, sort = "latest", page = 1, limit = 10 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (!Number.isInteger(pageNum) || pageNum < 1 || !Number.isInteger(limitNum) || limitNum < 1) {
    return res.status(400).json(fail("page와 limit은 1 이상의 정수여야 합니다"));
  }
  if (!SORTS.includes(sort)) {
    return res.status(400).json(fail("sort는 latest 또는 oldest만 가능합니다"));
  }

  let result = store.findAllPosts();

  if (author) {
    result = result.filter((p) => p.author === author);
  }
  if (search) {
    result = result.filter((p) => p.title.includes(search));
  }

  // 원본 배열을 건드리지 않도록 복사한 뒤 정렬 (시간이 같으면 id 순)
  const dir = sort === "latest" ? -1 : 1;
  result = [...result].sort(
    (a, b) => dir * (a.createdAt.localeCompare(b.createdAt) || a.id - b.id)
  );

  const total = result.length;
  const totalPages = Math.ceil(total / limitNum);
  const start = (pageNum - 1) * limitNum;
  const data = result.slice(start, start + limitNum);

  return res.json(success(data, { page: pageNum, limit: limitNum, total, totalPages }));
});

// 단건 조회
router.get("/:id", (req, res, next) => {
  const post = store.findPostById(Number(req.params.id));
  if (!post) return next(postNotFound());   // ← 에러 핸들러로 전달

  return res.json(success(post));
});

// 생성
router.post("/", (req, res) => {
  const { title, content, author } = req.body;

  const error = validatePost({ title, content });
  if (error) return res.status(400).json(fail(error));

  const post = store.createPost({ title, content, author: author || "익명" });
  return res.status(201).json(success(post));
});

// PUT vs PATCH
// - PUT   : 자원 "전체"를 보낸 내용으로 교체합니다. 그래서 title, content가 모두 필수이고
//           author를 빼고 보내면 "익명"으로 바뀝니다. (보내지 않은 필드 = 비우겠다는 뜻)
// - PATCH : 보낸 필드"만" 바꿉니다. 안 보낸 필드는 그대로 유지됩니다.

// 전체 수정
router.put("/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (!store.findPostById(id)) return next(postNotFound());

  const { title, content, author } = req.body;

  const error = validatePost({ title, content });
  if (error) return res.status(400).json(fail(error));

  const post = store.replacePost(id, { title, content, author: author || "익명" });
  return res.json(success(post));
});

// 부분 수정
router.patch("/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (!store.findPostById(id)) return next(postNotFound());

  const { title, content } = req.body;

  const error = validatePost({ title, content }, { partial: true });
  if (error) return res.status(400).json(fail(error));

  const fields = {};
  if (title !== undefined) fields.title = title;
  if (content !== undefined) fields.content = content;

  const post = store.updatePost(id, fields);
  return res.json(success(post));
});

// 삭제 (딸린 댓글도 함께 삭제됩니다)
router.delete("/:id", (req, res, next) => {
  const removed = store.removePost(Number(req.params.id));
  if (!removed) return next(postNotFound());

  return res.status(204).end();
});

module.exports = router;
