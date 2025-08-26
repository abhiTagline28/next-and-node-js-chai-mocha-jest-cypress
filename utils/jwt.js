const jwt = require("jsonwebtoken");
const config = require("../config");

// Create JWT token
const createJWT = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

// Verify JWT token
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Decode JWT token (without verification)
const decodeJWT = (token) => {
  return jwt.decode(token);
};

module.exports = {
  createJWT,
  verifyJWT,
  decodeJWT,
};
