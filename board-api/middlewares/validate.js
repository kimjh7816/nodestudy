const { validationResult } = require("express-validator");
const { fail } = require("../utils/response");
const { removeRequestFiles } = require("../utils/files");

// validators/의 규칙을 통과하지 못하면 400 — 첫 번째 메시지 + 전체 목록
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    removeRequestFiles(req);   // 검증 실패면 이미 저장된 업로드 파일은 지웁니다
    // 보낸 값(value)은 응답에 넣지 않습니다 — 비밀번호가 그대로 되돌아가지 않도록
    const list = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ ...fail(list[0].message), errors: list });
  }
  next();
};

module.exports = validate;
