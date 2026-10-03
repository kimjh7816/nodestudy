const AppError = require("./AppError");

// URL의 id(문자열)를 1 이상의 정수로 변환합니다. 아니면 400 에러를 던집니다.
const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError("올바르지 않은 ID입니다", 400);
  }
  return id;
};

module.exports = parseId;
