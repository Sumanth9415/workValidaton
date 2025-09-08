// JWT utility functions will go here
// server/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id, role) => {
  return jwt.sign({ user: { id, role } }, process.env.JWT_SECRET, {
    expiresIn: '5h', // Token expires in 5 hours
  });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.user;
  } catch (err) {
    return null; // Token is invalid or expired
  }
};

module.exports = { generateToken, verifyToken };