require("dotenv").config();   // ← 반드시 맨 위 (lib/prisma보다 먼저 환경변수를 읽어야 함)
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");
const { fail } = require("./utils/response");
const prisma = require("./lib/prisma");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 전역 미들웨어
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));   // 보안 헤더 (다른 도메인에서 /uploads 이미지 허용)
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));   // 업로드한 파일을 브라우저에서 보기

// 2. 로그인 시도 제한 — 무차별 대입 공격 방어 (15분에 10회)
app.use(
  "/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: fail("너무 많은 시도입니다. 잠시 후 다시 시도하세요"),
  })
);

// 3. 라우트
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use(require("./routes/comments"));   // /posts/:id/comments, /comments/:id (경로를 라우터 안에 적음)
app.use("/posts", require("./routes/posts"));
app.use("/tags", require("./routes/tags"));

// 4. 404
app.use((req, res) => {
  res.status(404).json(fail(`${req.method} ${req.url} 경로가 없습니다`));
});

// 5. 에러 핸들러 (반드시 맨 마지막)
app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("MySQL 연결 성공");
  } catch (err) {
    console.error("MySQL 연결 실패:", err.message);
  }
  console.log(`http://localhost:${PORT}`);
});
