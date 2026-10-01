// URL의 id(문자열)를 1 이상의 정수로 변환합니다. 아니면 400 에러를 던집니다.
const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const err = new Error("올바르지 않은 ID입니다");
    err.status = 400;
    throw err;
  }
  return id;
};

module.exports = parseId;
