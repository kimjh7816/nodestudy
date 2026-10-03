const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/response");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/token");

// 회원가입 — validators/auth.js가 trim·소문자 변환·길이 검사를 마친 값이 들어옵니다
exports.signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 중복 확인 — UNIQUE 제약이 있어도 미리 확인하면 어느 값이 겹쳤는지 알려줄 수 있습니다
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true },
  });
  if (exists) {
    const field = exists.email === email ? "이메일" : "사용자명";
    return res.status(409).json(fail(`이미 사용 중인 ${field}입니다`));
  }

  const user = await prisma.user.create({
    data: { username, email, password: await hashPassword(password) },
  });

  res.status(201).json(success(user));   // 전역 omit 덕분에 password 없음
});

// 내 정보 — protect가 이미 사용자를 찾아 req.user에 넣어줬습니다 (password는 전역 omit으로 없음)
exports.getMe = (req, res) => {
  res.json(success(req.user));
};

// 로그인 — 성공하면 토큰 발급
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 전역 omit으로 빠진 password를 이 쿼리에서만 가져옵니다
  const user = await prisma.user.findUnique({
    where: { email },
    omit: { password: false },
  });

  // 이메일이 없는 경우와 비밀번호가 틀린 경우를 같은 메시지로 — 가입된 이메일을 알아낼 수 없게
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json(fail("이메일 또는 비밀번호가 올바르지 않습니다"));
  }

  const { password: _, ...safeUser } = user;   // 응답에서 password 제거

  res.json(success({ token: generateToken(user.id), user: safeUser }));
});
