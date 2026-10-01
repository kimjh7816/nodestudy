require("dotenv").config();   // ← 반드시 맨 위 (lib/prisma보다 먼저 환경변수를 읽어야 함)
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const usersRouter = require("./routes/users");
const tagsRouter = require("./routes/tags");
const errorHandler = require("./middlewares/errorHandler");
const { fail } = require("./utils/response");
const prisma = require("./lib/prisma");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 전역 미들웨어
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// 2. 라우트
app.use(commentsRouter);   // /posts/:id/comments, /comments/:id (경로를 라우터 안에 적음)
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/tags", tagsRouter);

// 3. 404 핸들러
app.use((req, res) => {
  res.status(404).json(fail(`${req.method} ${req.url} 경로가 없습니다`));
});

// 4. 에러 핸들러 (반드시 맨 마지막)
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
