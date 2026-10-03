// async 핸들러의 에러를 잡아 next(err)로 넘깁니다 — 컨트롤러에서 try/catch가 필요 없어집니다
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
