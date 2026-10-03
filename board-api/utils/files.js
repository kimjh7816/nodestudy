const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// "/uploads/abc.jpg" 같은 URL로 디스크의 파일을 지웁니다 (없어도 에러 내지 않음)
const removeUploadByUrl = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
};

// 요청 처리 중 실패하면 multer가 이미 저장한 파일을 지웁니다 (고아 파일 방지)
const removeRequestFiles = (req) => {
  const files = [...(req.files || []), ...(req.file ? [req.file] : [])];
  files.forEach((file) => fs.unlink(file.path, () => {}));
};

module.exports = { UPLOAD_DIR, removeUploadByUrl, removeRequestFiles };
