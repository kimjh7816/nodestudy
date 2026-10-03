// 게시글 응답 공통 처리 — GET /posts, GET /posts/:id, GET /users/:id/posts 가 같은 모양을 쓰도록 모아둡니다
const prisma = require("../lib/prisma");

const LIMIT_MAX = 50;

// 작성자는 필요한 필드만 (이메일 등은 노출하지 않음)
const authorSelect = { select: { id: true, username: true, profileImage: true } };

// 태그는 이름만, 가나다순으로
const tagsSelect = { select: { name: true }, orderBy: { name: "asc" } };

// 사진은 순서대로
const imagesSelect = { select: { id: true, url: true, order: true }, orderBy: { order: "asc" } };

// 정렬 기준 — latest(기본) / oldest / popular(좋아요 많은 순)
const buildOrderBy = (sort) => {
  if (sort === "oldest") return [{ createdAt: "asc" }, { id: "asc" }];
  if (sort === "popular") return [{ likes: { _count: "desc" } }, { createdAt: "desc" }, { id: "desc" }];
  return [{ createdAt: "desc" }, { id: "desc" }];
};

// 페이지 계산 (잘못된 값은 기본값으로, limit 상한 50)
const parsePaging = ({ page, limit }) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(LIMIT_MAX, Math.max(1, Number(limit) || 10));
  return { pageNum, limitNum };
};

// 목록·단건에 붙일 관계 데이터
// userId: 로그인한 사용자 id (비로그인이면 undefined → 내 좋아요는 조회하지 않음)
// ※ where: { userId: undefined }는 Prisma가 "조건 없음"으로 처리해 모든 좋아요를 가져오므로 반드시 분기합니다
const buildPostInclude = (userId) => ({
  author: authorSelect,
  tags: tagsSelect,
  images: imagesSelect,
  _count: { select: { likes: true, comments: true } },
  ...(userId && { likes: { where: { userId }, select: { userId: true } } }),   // 내 좋아요만
});

// 태그 객체 배열 [{ name: "여행" }] → 이름 배열 ["여행"]
const toTagNames = (tags) => tags.map((t) => t.name);

// 응답 모양 다듬기: _count, likes를 꺼내서 숫자/불리언으로, 태그는 이름 배열로 바꿉니다
const toPostItem = ({ likes, _count, tags, ...post }) => ({
  ...post,
  tags: toTagNames(tags),
  likeCount: _count.likes,
  commentCount: _count.comments,
  isLiked: Boolean(likes && likes.length > 0),   // 비로그인이면 항상 false
});

// where 조건으로 목록 + 페이지 정보를 만들어 돌려줍니다
const findPostPage = async ({ where, query, userId }) => {
  const { pageNum, limitNum } = parsePaging(query);

  // 데이터와 총 개수를 동시에 조회
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: buildPostInclude(userId),
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts.map(toPostItem),
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
};

module.exports = {
  authorSelect,
  tagsSelect,
  imagesSelect,
  buildPostInclude,
  toTagNames,
  toPostItem,
  findPostPage,
};
