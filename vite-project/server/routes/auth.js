const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email || !email.trim()) return res.status(400).json({ message: "Email is required" });
    if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "This email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name.trim(), normalizedEmail, passwordHash]
    );
    const newUser = result.rows[0];

    await pool.query("INSERT INTO profiles (user_id) VALUES ($1)", [newUser.id]);

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const normalized = username.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(name) = $1 OR LOWER(email) = $1",
      [normalized]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid username/email or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid username/email or password" });

    const token = jwt.sign({ id: user.id, username: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;