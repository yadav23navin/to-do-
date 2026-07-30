const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [req.user.id]);
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile", error: err.message });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const { role, location, bio, experience, skills, phone, github, linkedin, portfolio, theme } = req.body;
    const result = await pool.query(
      `UPDATE profiles SET
        role = $1, location = $2, bio = $3, experience = $4,
        skills = $5, phone = $6, github = $7, linkedin = $8, portfolio = $9, theme = $10
       WHERE user_id = $11
       RETURNING *`,
      [role, location, bio, experience, skills, phone, github, linkedin, portfolio, theme, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

// Change password. Verifies the current password before writing a new
// hash. Wrong-current-password is returned as 400 (not 401) so the
// frontend can tell it apart from an expired/invalid auth token — a 401
// here would incorrectly force-logout the user for a simple typo.
router.put("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, req.user.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password", error: err.message });
  }
});

module.exports = router;