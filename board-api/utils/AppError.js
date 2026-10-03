// 상태 코드를 가진 에러 — throw new AppError("게시글을 찾을 수 없습니다", 404)
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

module.exports = AppError;
