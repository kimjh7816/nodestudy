const { body } = require("express-validator");

// trim(), toLowerCase()는 검사만 하는 게 아니라 req.body의 값 자체를 정리해 줍니다
exports.signupRules = [
  body("username")
    .trim()
    .isLength({ min: 2, max: 20 }).withMessage("사용자명은 2~20자여야 합니다"),
  body("email")
    .trim()
    .isEmail().withMessage("올바른 이메일 형식이 아닙니다")
    .toLowerCase(),
  body("password")
    .isString().withMessage("비밀번호는 8자 이상이어야 합니다")
    .isLength({ min: 8 }).withMessage("비밀번호는 8자 이상이어야 합니다"),
];

exports.loginRules = [
  body("email").trim().isEmail().withMessage("이메일을 입력하세요").toLowerCase(),
  body("password").notEmpty().withMessage("비밀번호를 입력하세요"),
];
