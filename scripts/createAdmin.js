require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const authService = require("../services/authService");

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file first.");
    process.exit(1);
  }

  await connectDB();

  const user = await authService.createOrUpdateAdmin(username, password);
  console.log(`Admin user ready: ${user.username}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
