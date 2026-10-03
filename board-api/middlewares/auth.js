const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { fail } = require("../utils/response");

// Authorization: Bearer <토큰> 에서 토큰만 꺼냅니다
const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

// 로그인 필수 — 토큰이 없거나 잘못되면 401
const protect = async (req, res, next) => {
  try {
    // 1. 헤더에서 토큰 꺼내기
    const token = getToken(req);
    if (!token) return res.status(401).json(fail("로그인이 필요합니다"));

    // 2. 토큰 검증 (위조·만료면 여기서 throw)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 사용자 조회 (탈퇴한 사용자의 토큰을 걸러냅니다) — 전역 omit으로 password는 빠져 있음
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json(fail("존재하지 않는 사용자입니다"));

    // 4. req에 심어서 다음으로 전달
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json(fail("토큰이 만료되었습니다. 다시 로그인하세요"));
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json(fail("유효하지 않은 토큰입니다"));
    }
    next(err);
  }
};

// 로그인 선택 — 로그인했으면 req.user를 채우고, 아니면(토큰이 잘못돼도) 비로그인으로 진행
const optionalAuth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
    }
  } catch (err) {
    // 토큰이 잘못돼도 그냥 비로그인으로 처리
  }
  next();
};

module.exports = { protect, optionalAuth };
