const prisma = require("../lib/prisma");
const parseId = require("../utils/parseId");
const { fail } = require("../utils/response");

const LABELS = { post: "게시글", comment: "댓글" };

// 소유권 확인 — protect 다음에 와야 합니다 (req.user가 있다고 가정)
// modelName: "post", "comment" 처럼 Prisma 모델 이름(소문자). prisma[modelName] = prisma.post
const checkOwner = (modelName) => async (req, res, next) => {
  try {
    const doc = await prisma[modelName].findUnique({
      where: { id: parseId(req.params.id) },
    });

    const label = LABELS[modelName] || "대상";
    if (!doc) return res.status(404).json(fail(`${label}을(를) 찾을 수 없습니다`));
    if (doc.authorId !== req.user.id) return res.status(403).json(fail("권한이 없습니다"));

    req.doc = doc;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = checkOwner;
