const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function verifyCredentials(username, password) {
  const user = await User.findOne({ username });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

async function createOrUpdateAdmin(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate(
    { username },
    { username, passwordHash },
    { upsert: true, new: true }
  );
}

module.exports = { verifyCredentials, createOrUpdateAdmin };
