// 게시글 목록 공통 처리 — GET /posts 와 GET /users/:id/posts 가 같은 응답 모양을 쓰도록 모아둡니다
const prisma = require("../lib/prisma");

const LIMIT_MAX = 50;

// 지금 로그인한 사용자라고 가정하는 id (4주차에 토큰으로 교체)
const CURRENT_USER_ID = 1;

// 작성자는 필요한 필드만 (이메일 등은 노출하지 않음)
const authorSelect = { select: { id: true, username: true } };

// 태그는 이름만, 가나다순으로
const tagsSelect = { select: { name: true }, orderBy: { name: "asc" } };

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

// 목록의 각 글에 붙일 관계 데이터
const listInclude = {
  author: authorSelect,
  tags: tagsSelect,
  _count: { select: { likes: true, comments: true } },
  likes: { where: { userId: CURRENT_USER_ID }, select: { userId: true } },   // 내 좋아요만
};

// 태그 객체 배열 [{ name: "여행" }] → 이름 배열 ["여행"]
const toTagNames = (tags) => tags.map((t) => t.name);

// 응답 모양 다듬기: _count, likes를 꺼내서 숫자/불리언으로, 태그는 이름 배열로 바꿉니다
const toPostItem = ({ likes, _count, tags, ...post }) => ({
  ...post,
  tags: toTagNames(tags),
  likeCount: _count.likes,
  commentCount: _count.comments,
  isLiked: likes.length > 0,
});

// where 조건으로 목록 + 페이지 정보를 만들어 돌려줍니다
const findPostPage = async ({ where, query }) => {
  const { pageNum, limitNum } = parsePaging(query);

  // 데이터와 총 개수를 동시에 조회
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: listInclude,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts.map(toPostItem),
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
};

module.exports = { CURRENT_USER_ID, authorSelect, tagsSelect, toTagNames, toPostItem, findPostPage };
