// 메모리 저장소 — 서버를 끄면 데이터가 날아갑니다.
// 3주차에는 이 파일의 함수 내용만 DB 쿼리로 바꾸면 라우터는 그대로 쓸 수 있습니다.

let posts = [
  { id: 1, title: "첫 글", content: "안녕하세요", author: "철수", createdAt: "2026-09-01T09:00:00.000Z" },
  { id: 2, title: "두 번째", content: "반갑습니다", author: "영희", createdAt: "2026-09-02T09:00:00.000Z" },
  { id: 3, title: "제주도 여행 후기", content: "날씨가 좋았어요", author: "철수", createdAt: "2026-09-03T09:00:00.000Z" },
];
let nextPostId = 4;

let comments = [
  { id: 1, postId: 1, content: "첫 댓글!", author: "영희", createdAt: "2026-09-01T10:00:00.000Z" },
  { id: 2, postId: 1, content: "반가워요", author: "민수", createdAt: "2026-09-01T11:00:00.000Z" },
];
let nextCommentId = 3;

const now = () => new Date().toISOString();

// ───── 게시글 ─────

const findAllPosts = () => posts;

const findPostById = (id) => posts.find((p) => p.id === id);

const createPost = ({ title, content, author }) => {
  const post = { id: nextPostId++, title, content, author, createdAt: now() };
  posts.push(post);
  return post;
};

// 전달된 필드만 바꿉니다 (PATCH)
const updatePost = (id, fields) => {
  const post = findPostById(id);
  if (!post) return null;

  Object.assign(post, fields, { updatedAt: now() });
  return post;
};

// id, createdAt만 남기고 전체를 교체합니다 (PUT)
const replacePost = (id, { title, content, author }) => {
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const { createdAt } = posts[idx];
  posts[idx] = { id, title, content, author, createdAt, updatedAt: now() };
  return posts[idx];
};

// 게시글을 지우면 딸린 댓글도 함께 지웁니다
const removePost = (id) => {
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return false;

  posts.splice(idx, 1);
  comments = comments.filter((c) => c.postId !== id);
  return true;
};

// ───── 댓글 ─────

const findCommentsByPostId = (postId) => comments.filter((c) => c.postId === postId);

const createComment = ({ postId, content, author }) => {
  const comment = { id: nextCommentId++, postId, content, author, createdAt: now() };
  comments.push(comment);
  return comment;
};

// 해당 게시글에 속한 댓글만 지울 수 있습니다
const removeComment = (postId, commentId) => {
  const idx = comments.findIndex((c) => c.id === commentId && c.postId === postId);
  if (idx === -1) return false;

  comments.splice(idx, 1);
  return true;
};

module.exports = {
  findAllPosts,
  findPostById,
  createPost,
  updatePost,
  replacePost,
  removePost,
  findCommentsByPostId,
  createComment,
  removeComment,
};
