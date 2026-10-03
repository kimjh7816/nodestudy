const { body } = require("express-validator");

const CONTENT_MAX = 500;   // schema.prisma의 @db.VarChar(500)

exports.commentRules = [
  body("content")
    .trim()
    .notEmpty().withMessage("댓글 내용은 필수입니다")
    .isLength({ max: CONTENT_MAX }).withMessage(`댓글은 ${CONTENT_MAX}자를 넘을 수 없습니다`),
];
