const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");
const { UPLOAD_DIR } = require("../utils/files");

// 저장 폴더가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 원본 파일명은 쓰지 않고 서버가 고유한 이름을 만듭니다 (덮어쓰기·경로 탈출 공격 방지)
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

// 이미지 파일만 허용
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("이미지 파일만 업로드할 수 있습니다", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5MB
    files: 10,                    // 최대 10개
  },
});

module.exports = upload;
