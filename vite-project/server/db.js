require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
  console.log("Connected to Postgres database");
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres error", err);
  process.exit(1);
});

module.exports = pool;
