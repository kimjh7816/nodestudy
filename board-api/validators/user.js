const { body } = require("express-validator");

const BIO_MAX = 150;   // schema.prisma의 @db.VarChar(150)

// 프로필 수정 — bio는 선택
exports.profileRules = [
  body("bio")
    .optional()
    .isString().withMessage(`소개는 ${BIO_MAX}자 이하의 문자열이어야 합니다`)
    .trim()
    .isLength({ max: BIO_MAX }).withMessage(`소개는 ${BIO_MAX}자를 넘을 수 없습니다`),
];
