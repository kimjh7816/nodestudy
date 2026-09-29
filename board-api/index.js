const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const usersRouter = require("./routes/users");
const errorHandler = require("./middlewares/errorHandler");
const { fail } = require("./utils/response");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 전역 미들웨어
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// 2. 라우트
app.use("/posts/:postId/comments", commentsRouter);
app.use("/posts", postsRouter);
app.use("/users", usersRouter);

// 3. 404 핸들러
app.use((req, res) => {
  res.status(404).json(fail(`${req.method} ${req.url} 경로가 없습니다`));
});

// 4. 에러 핸들러 (반드시 맨 마지막)
app.use(errorHandler);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
