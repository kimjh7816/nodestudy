// 성공 응답 형식 통일: { success: true, ...meta, data }
const success = (data, meta = {}) => ({ success: true, ...meta, data });

// 실패 응답 형식 통일: { success: false, message }
const fail = (message) => ({ success: false, message });

// 상태 코드를 가진 에러 객체 — next(httpError(404, "...")) 로 에러 핸들러에 넘깁니다
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

module.exports = { success, fail, httpError };
