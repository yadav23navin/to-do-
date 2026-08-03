const crypto = require("crypto");
const bcrypt = require("bcrypt");

function generateOtp() {
  // 6-digit numeric OTP, cryptographically random (100000-999999)
  return crypto.randomInt(100000, 1000000).toString();
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };