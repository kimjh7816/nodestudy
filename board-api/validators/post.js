const { body } = require("express-validator");

const TITLE_MAX = 100;

// 작성 / 전체 수정(PUT) — title, content 필수
exports.postRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("제목은 필수입니다")
    .isLength({ max: TITLE_MAX }).withMessage(`제목은 ${TITLE_MAX}자를 넘을 수 없습니다`),
  body("content").trim().notEmpty().withMessage("내용은 필수입니다"),
];

// 부분 수정(PATCH) — 보낸 필드만 검사
exports.postUpdateRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("제목은 비어 있을 수 없습니다")
    .isLength({ max: TITLE_MAX }).withMessage(`제목은 ${TITLE_MAX}자를 넘을 수 없습니다`),
  body("content").optional().trim().notEmpty().withMessage("내용은 비어 있을 수 없습니다"),
];
