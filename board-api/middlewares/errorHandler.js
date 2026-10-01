const { fail } = require("../utils/response");

// 인자가 4개인 미들웨어 → Express가 에러 처리기로 인식합니다
const errorHandler = (err, req, res, next) => {
  // Prisma 에러 코드 → HTTP 상태 코드
  if (err.code === "P2002") {
    return res.status(409).json(fail("이미 사용 중인 값입니다"));   // UNIQUE 위반
  }
  if (err.code === "P2025") {
    return res.status(404).json(fail("대상을 찾을 수 없습니다"));   // 수정·삭제할 대상 없음
  }
  if (err.code === "P2003") {
    return res.status(400).json(fail("참조하는 데이터가 존재하지 않습니다"));   // 외래 키 위반
  }
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json(fail("요청 데이터 형식이 올바르지 않습니다"));
  }

  const status = err.status || 500;

  // 예상하지 못한 에러(500)만 스택을 찍습니다
  if (status >= 500) console.error(err);

  return res.status(status).json(fail(err.message || "서버 오류가 발생했습니다"));
};

module.exports = errorHandler;
