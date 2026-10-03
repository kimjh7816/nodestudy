// 성공 응답 형식 통일: { success: true, ...meta, data }
const success = (data, meta = {}) => ({ success: true, ...meta, data });

// 실패 응답 형식 통일: { success: false, message }
const fail = (message) => ({ success: false, message });

module.exports = { success, fail };
