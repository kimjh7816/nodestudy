const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");
const { success } = require("../utils/response");
const { removeUploadByUrl } = require("../utils/files");
const { authorSelect, buildPostInclude, toPostItem, findPostPage } = require("../utils/postList");

const TAG_MAX = 30;        // schema.prisma의 Tag.name @db.VarChar(30)
const TAGS_PER_POST = 10;

// 태그 입력 정리 → 이름 배열. 문제가 있으면 400을 던집니다.
// JSON 요청이면 ["여행", "제주"] 배열로, multipart(form-data) 요청이면 문자열로 옵니다.
//   "여행,제주"  또는  '["여행","제주"]'  둘 다 받습니다.
const parseTags = (raw) => {
  let tags = raw;
  if (typeof tags === "string") {
    const text = tags.trim();
    if (text.startsWith("[")) {
      try {
        tags = JSON.parse(text);
      } catch {
        throw new AppError("tags 형식이 올바르지 않습니다", 400);
      }
    } else {
      tags = text === "" ? [] : text.split(",");
    }
  }
  if (!Array.isArray(tags)) throw new AppError("tags는 문자열 배열이어야 합니다", 400);

  const names = [];
  for (const tag of tags) {
    if (typeof tag !== "string" || tag.trim() === "") throw new AppError("태그는 비어 있을 수 없습니다", 400);
    const name = tag.trim();
    if (name.length > TAG_MAX) throw new AppError(`태그는 ${TAG_MAX}자를 넘을 수 없습니다`, 400);
    if (!names.includes(name)) names.push(name);   // 중복 제거
  }
  if (names.length > TAGS_PER_POST) throw new AppError(`태그는 ${TAGS_PER_POST}개까지 붙일 수 있습니다`, 400);

  return names;
};

// 태그 이름으로 연결 — 이미 있는 태그면 연결만, 없으면 새로 만들어서 연결 (암시적 N:M)
const connectTags = (names) => ({
  connectOrCreate: names.map((name) => ({ where: { name }, create: { name } })),
});

// 목록 조회 — ?authorId= &author=(username) &search= &tag= &sort=latest|oldest|popular &page= &limit=
exports.getPosts = asyncHandler(async (req, res) => {
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

  // 정렬·페이지·관계 포함은 utils/postList.js 에서 공통 처리. 로그인했으면 isLiked 계산
  const { data, meta } = await findPostPage({ where, query: req.query, userId: req.user?.id });

  res.json(success(data, meta));
});

// 단건 조회 — 게시글 + 작성자 + 사진 + 태그 + 댓글(+ 댓글 작성자) + 개수를 한 번에
exports.getPost = asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: parseId(req.params.id) },
    include: {
      ...buildPostInclude(req.user?.id),
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: authorSelect },
      },
    },
  });

  // findUnique는 못 찾으면 에러가 아니라 null을 돌려줍니다
  if (!post) throw new AppError("게시글을 찾을 수 없습니다", 404);

  res.json(success(toPostItem(post)));
});

// 작성 — 작성자는 토큰의 사용자(req.user.id). 사진은 multer가 저장한 req.files
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;   // req.body를 통째로 넘기지 않고 필요한 필드만 (validator가 trim 완료)
  const names = parseTags(req.body.tags ?? []);
  const files = req.files || [];

  // 중첩 생성 — 게시글과 사진 행을 한 번에 만들고, postId는 Prisma가 채웁니다 (내부적으로 트랜잭션)
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: req.user.id,   // ← 클라이언트가 보낸 값이 아니라 토큰에서 꺼낸 값
      tags: connectTags(names),
      images: {
        create: files.map((file, i) => ({ url: `/uploads/${file.filename}`, order: i })),
      },
    },
    include: buildPostInclude(req.user.id),
  });

  res.status(201).json(success(toPostItem(post)));
});

// PUT vs PATCH
// - PUT   : 수정 가능한 필드(title, content, tags) "전체"를 교체합니다. title, content는 필수이고
//           tags를 안 보내면 태그가 모두 떼어집니다. (안 보낸 필드 = 비우겠다는 뜻)
// - PATCH : 보낸 필드"만" 바꿉니다. 안 보낸 필드는 그대로 유지됩니다.
// 둘 다 checkOwner("post")가 존재 여부(404)와 소유권(403)을 먼저 확인합니다.

// 전체 수정
exports.replacePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const names = parseTags(req.body.tags ?? []);

  const post = await prisma.post.update({
    where: { id: req.doc.id },
    data: { title, content, tags: { set: [], ...connectTags(names) } },   // 기존 연결을 끊고 새로 연결
    include: buildPostInclude(req.user.id),
  });

  res.json(success(toPostItem(post)));
});

// 부분 수정
exports.updatePost = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  // tags를 보냈을 때만 태그를 교체합니다 (안 보내면 그대로)
  const tagsUpdate = tags === undefined ? undefined : { set: [], ...connectTags(parseTags(tags)) };

  // data에서 undefined인 필드는 Prisma가 무시합니다
  const post = await prisma.post.update({
    where: { id: req.doc.id },
    data: { title, content, tags: tagsUpdate },
    include: buildPostInclude(req.user.id),
  });

  res.json(success(toPostItem(post)));
});

// 삭제 — 댓글·좋아요·사진 행은 onDelete: Cascade로 DB가 함께 지웁니다. 디스크의 사진 파일은 직접 지웁니다.
exports.deletePost = asyncHandler(async (req, res) => {
  const images = await prisma.postImage.findMany({ where: { postId: req.doc.id }, select: { url: true } });

  await prisma.post.delete({ where: { id: req.doc.id } });
  images.forEach((image) => removeUploadByUrl(image.url));

  res.status(204).end();
});

// 좋아요 토글 — 누르면 추가, 다시 누르면 취소
exports.toggleLike = asyncHandler(async (req, res) => {
  const postId = parseId(req.params.id);
  const userId = req.user.id;   // 토큰의 사용자

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) throw new AppError("게시글을 찾을 수 없습니다", 404);

  // 복합 키(@@id([userId, postId]))로 찾을 때는 Prisma가 만든 userId_postId 이름을 씁니다
  const where = { userId_postId: { userId, postId } };
  const existing = await prisma.like.findUnique({ where });

  if (existing) {
    await prisma.like.delete({ where });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  // 좋아요 수는 숫자 열로 따로 두지 않고 중간 테이블의 행 개수를 셉니다
  const likeCount = await prisma.like.count({ where: { postId } });

  res.json(success({ liked: !existing, likeCount }));
});
