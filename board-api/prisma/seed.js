// 테스트용 초기 데이터 — `npm run seed`
// 모든 테이블을 비우고 id를 1부터 다시 시작합니다. (기존 데이터는 모두 지워집니다)
// ※ 외래 키 검사를 끄고 TRUNCATE 하는 방식은 쓰지 않습니다.
//   연결 풀(connectionLimit 5) 때문에 SET과 TRUNCATE가 서로 다른 연결에서 실행될 수 있어서입니다.
require("dotenv").config({ quiet: true });
const prisma = require("../lib/prisma");
const { hashPassword } = require("../utils/password");

// 모든 테스트 사용자의 비밀번호 (로그인: chulsoo@test.com / password1234)
const SEED_PASSWORD = "password1234";

const main = async () => {
  // 참조하는 쪽(좋아요·댓글) → 게시글 → 사용자 순으로 지웁니다. 하나라도 실패하면 전부 롤백(트랜잭션)
  await prisma.$transaction([
    prisma.like.deleteMany(),
    prisma.postImage.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tag.deleteMany(),   // 글과의 연결(_PostToTag)은 글을 지울 때 Cascade로 함께 지워짐
  ]);

  // id가 1부터 다시 시작하도록 AUTO_INCREMENT를 되돌립니다 (Like는 복합 키라 해당 없음)
  for (const table of ["PostImage", "Comment", "Post", "User", "Tag"]) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
  }

  const password = await hashPassword(SEED_PASSWORD);   // 비밀번호는 해시로 저장
  await prisma.user.createMany({
    data: [
      { username: "철수", email: "chulsoo@test.com", password },
      { username: "영희", email: "younghee@test.com", password },
      { username: "민수", email: "minsu@test.com", password },
    ],
  });

  await prisma.post.createMany({
    data: [
      { title: "첫 글", content: "안녕하세요", authorId: 1, createdAt: new Date("2026-09-01T09:00:00Z") },
      { title: "두 번째", content: "반갑습니다", authorId: 2, createdAt: new Date("2026-09-02T09:00:00Z") },
      { title: "제주도 여행 후기", content: "날씨가 좋았어요", authorId: 1, createdAt: new Date("2026-09-03T09:00:00Z") },
    ],
  });

  // 태그 연결 — createMany는 관계를 못 넣으므로 update + connectOrCreate
  const tagPost = (id, names) =>
    prisma.post.update({
      where: { id },
      data: { tags: { connectOrCreate: names.map((name) => ({ where: { name }, create: { name } })) } },
    });
  await tagPost(1, ["일상"]);
  await tagPost(3, ["여행", "제주"]);

  await prisma.comment.createMany({
    data: [
      { content: "첫 댓글!", postId: 1, authorId: 2, createdAt: new Date("2026-09-01T10:00:00Z") },
      { content: "반가워요", postId: 1, authorId: 3, createdAt: new Date("2026-09-01T11:00:00Z") },
    ],
  });

  await prisma.like.createMany({
    data: [
      { userId: 2, postId: 1 },
      { userId: 3, postId: 1 },
      { userId: 1, postId: 3 },
    ],
  });

  console.log(
    `시드 완료: 사용자 3명(1 철수, 2 영희, 3 민수 / 비밀번호 ${SEED_PASSWORD}), 게시글 3개, 댓글 2개(1번 글), 좋아요 3개, 태그 3개(일상·여행·제주)`
  );
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
