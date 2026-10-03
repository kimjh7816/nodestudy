const { PrismaClient } = require("../generated/prisma");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// Prisma 클라이언트는 앱 전체에서 딱 하나만 만들어 공유합니다.
// 라우트마다 새로 만들면 DB 연결이 폭증합니다.
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,   // 로컬 MySQL 8 인증 방식 대응 (배포 시에는 SSL을 쓰고 이 옵션은 뺍니다)
});

const prisma = new PrismaClient({
  adapter,
  omit: {
    user: { password: true },   // 모든 User 조회에서 password 기본 제외
  },
});

module.exports = prisma;
