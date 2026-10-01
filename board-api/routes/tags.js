const express = require("express");
const prisma = require("../lib/prisma");
const { success } = require("../utils/response");

const router = express.Router();

// 태그 목록 + 태그별 글 수 (글이 많은 순) — 글이 하나도 없는 태그는 빼고 보여줍니다
router.get("/", async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { posts: { some: {} } },
      orderBy: [{ posts: { _count: "desc" } }, { name: "asc" }],
      select: { name: true, _count: { select: { posts: true } } },
    });

    const data = tags.map(({ name, _count }) => ({ name, postCount: _count.posts }));
    return res.json(success(data, { count: data.length }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
