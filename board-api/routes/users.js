const express = require("express");
const { success } = require("../utils/response");
const router = express.Router();

// req에 정보 심어주기 (4주차에는 JWT 검증 후 로그인한 사용자를 심어줍니다)
const attachUser = (req, res, next) => {
  req.user = { id: 1, name: "철수" };
  next();
};

// 내 정보 — GET /users/me
router.get("/me", attachUser, (req, res) => {
  return res.json(success(req.user));
});

module.exports = router;
