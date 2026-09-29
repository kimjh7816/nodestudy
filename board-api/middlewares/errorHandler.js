const { fail } = require("../utils/response");

// 인자가 4개인 미들웨어 → Express가 에러 처리기로 인식합니다
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  // 예상하지 못한 에러(500)만 스택을 찍습니다
  if (status >= 500) console.error(err.stack);

  return res.status(status).json(fail(err.message || "서버 오류가 발생했습니다"));
};

module.exports = errorHandler;
