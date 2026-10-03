const jwt = require("jsonwebtoken");

const generateToken = (userId) =>
  jwt.sign(
    { id: userId },                              // payload
    process.env.JWT_SECRET,                      // 비밀키
    { expiresIn: process.env.JWT_EXPIRES_IN }    // 만료 기간
  );

module.exports = { generateToken };