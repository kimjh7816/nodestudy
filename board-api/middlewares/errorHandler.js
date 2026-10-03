const multer = require("multer");
const { fail } = require("../utils/response");
const { removeRequestFiles } = require("../utils/files");

// 인자가 4개인 미들웨어 → Express가 에러 처리기로 인식합니다
const errorHandler = (err, req, res, next) => {
  // 요청 처리 중 실패했으면 이미 저장된 업로드 파일은 지웁니다
  removeRequestFiles(req);

  const send = (status, message) => res.status(status).json(fail(message));

  // multer
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return send(400, "파일 크기는 5MB를 넘을 수 없습니다");
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return send(400, "파일 개수가 너무 많거나 필드명이 올바르지 않습니다");
    }
    return send(400, "파일 업로드 요청이 올바르지 않습니다");
  }

  // Prisma 에러 코드 → HTTP 상태 코드
  if (err.code === "P2002") return send(409, "이미 사용 중인 값입니다");             // UNIQUE 위반
  if (err.code === "P2025") return send(404, "대상을 찾을 수 없습니다");             // 수정·삭제할 대상 없음
  if (err.code === "P2003") return send(400, "참조하는 데이터가 존재하지 않습니다"); // 외래 키 위반
  if (err.name === "PrismaClientValidationError") return send(400, "요청 데이터 형식이 올바르지 않습니다");

  // JSON 파싱 실패 (잘못된 JSON 본문)
  if (err.type === "entity.parse.failed") return send(400, "JSON 형식이 올바르지 않습니다");

  // AppError 및 기타
  const status = err.status || 500;

  // 예상하지 못한 에러(500)는 서버 로그에만 자세히 남기고, 클라이언트에는 내부 메시지를 숨깁니다
  if (status >= 500) console.error(err);

  return send(status, status >= 500 ? "서버 오류가 발생했습니다" : err.message);
};

module.exports = errorHandler;
