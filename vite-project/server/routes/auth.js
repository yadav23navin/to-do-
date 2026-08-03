const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../db");
const { JWT_SECRET } = require("../middleware/auth");
const { sendOtpEmail, sendResetEmail  } = require("../config/mailer");
const { generateOtp, hashOtp, verifyOtp } = require("../utils/otp");


const router = express.Router();

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post("/register", registerLimiter, async (req, res) => {
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

    const existingPending = await pool.query(
      "SELECT last_sent_at FROM pending_registrations WHERE email = $1",
      [normalizedEmail]
    );
    if (existingPending.rows.length > 0) {
      const lastSent = new Date(existingPending.rows[0].last_sent_at).getTime();
      if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
        return res.status(429).json({ message: `Please wait ${waitSec}s before requesting another code` });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await pool.query(
      `INSERT INTO pending_registrations (name, email, password_hash, otp_hash, otp_expires_at, attempt_count, last_sent_at)
       VALUES ($1, $2, $3, $4, $5, 0, NOW())
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         otp_hash = EXCLUDED.otp_hash,
         otp_expires_at = EXCLUDED.otp_expires_at,
         attempt_count = 0,
         last_sent_at = NOW()`,
      [name.trim(), normalizedEmail, passwordHash, otpHash, expiresAt]
    );

    await sendOtpEmail(normalizedEmail, otp);

    res.status(200).json({ message: "Verification code sent to your email", email: normalizedEmail });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

router.post("/verify-otp", verifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and code are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM pending_registrations WHERE email = $1",
      [normalizedEmail]
    );
    const pending = result.rows[0];

    if (!pending) {
      return res.status(400).json({ message: "No pending registration found. Please register again." });
    }

    if (new Date(pending.otp_expires_at).getTime() < Date.now()) {
      await pool.query("DELETE FROM pending_registrations WHERE email = $1", [normalizedEmail]);
      return res.status(400).json({ message: "Code expired. Please register again." });
    }

    if (pending.attempt_count >= MAX_ATTEMPTS) {
      await pool.query("DELETE FROM pending_registrations WHERE email = $1", [normalizedEmail]);
      return res.status(429).json({ message: "Too many incorrect attempts. Please register again." });
    }

    const isValid = await verifyOtp(String(otp).trim(), pending.otp_hash);
    if (!isValid) {
      await pool.query(
        "UPDATE pending_registrations SET attempt_count = attempt_count + 1 WHERE email = $1",
        [normalizedEmail]
      );
      return res.status(400).json({ message: "Invalid code" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existing = await client.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
      if (existing.rows.length > 0) {
        await client.query("ROLLBACK");
        await pool.query("DELETE FROM pending_registrations WHERE email = $1", [normalizedEmail]);
        return res.status(409).json({ message: "This email is already registered" });
      }

      const insertResult = await client.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
        [pending.name, pending.email, pending.password_hash]
      );
      const newUser = insertResult.rows[0];

      await client.query("INSERT INTO profiles (user_id) VALUES ($1)", [newUser.id]);
      await client.query("DELETE FROM pending_registrations WHERE email = $1", [normalizedEmail]);

      await client.query("COMMIT");

      res.status(201).json({ message: "Account verified successfully", user: newUser });
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

router.post("/resend-otp", registerLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query("SELECT * FROM pending_registrations WHERE email = $1", [normalizedEmail]);
    const pending = result.rows[0];
    if (!pending) {
      return res.status(400).json({ message: "No pending registration found. Please register again." });
    }

    const lastSent = new Date(pending.last_sent_at).getTime();
    if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      return res.status(429).json({ message: `Please wait ${waitSec}s before requesting another code` });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await pool.query(
      `UPDATE pending_registrations
       SET otp_hash = $1, otp_expires_at = $2, attempt_count = 0, last_sent_at = NOW()
       WHERE email = $3`,
      [otpHash, expiresAt, normalizedEmail]
    );

    await sendOtpEmail(normalizedEmail, otp);
    res.json({ message: "Verification code resent" });
  } catch (err) {
    res.status(500).json({ message: "Could not resend code", error: err.message });
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
const RESET_OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL = "15m";

const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const resetVerifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

// Step 1: request a reset code
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);

    // Always respond the same way whether or not the account exists,
    // so this endpoint can't be used to enumerate registered emails.
    const genericResponse = {
      message: "If an account exists for that email, a reset code has been sent.",
    };

    if (userResult.rows.length === 0) {
      return res.status(200).json(genericResponse);
    }

    const existing = await pool.query(
      "SELECT last_sent_at FROM password_resets WHERE email = $1",
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      const lastSent = new Date(existing.rows[0].last_sent_at).getTime();
      if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
        // Don't leak timing info either — just return the generic response.
        return res.status(200).json(genericResponse);
      }
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + RESET_OTP_TTL_MS);

    await pool.query(
      `INSERT INTO password_resets (email, otp_hash, otp_expires_at, attempt_count, last_sent_at)
       VALUES ($1, $2, $3, 0, NOW())
       ON CONFLICT (email) DO UPDATE SET
         otp_hash = EXCLUDED.otp_hash,
         otp_expires_at = EXCLUDED.otp_expires_at,
         attempt_count = 0,
         last_sent_at = NOW()`,
      [normalizedEmail, otpHash, expiresAt]
    );

    await sendResetEmail(normalizedEmail, otp);

    res.status(200).json(genericResponse);
  } catch (err) {
    res.status(500).json({ message: "Could not process request", error: err.message });
  }
});

// Step 2: verify the code, get a short-lived reset token back
router.post("/verify-reset-otp", resetVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and code are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query("SELECT * FROM password_resets WHERE email = $1", [normalizedEmail]);
    const record = result.rows[0];

    if (!record) {
      return res.status(400).json({ message: "No reset request found. Please start again." });
    }

    if (new Date(record.otp_expires_at).getTime() < Date.now()) {
      await pool.query("DELETE FROM password_resets WHERE email = $1", [normalizedEmail]);
      return res.status(400).json({ message: "Code expired. Please request a new one." });
    }

    if (record.attempt_count >= MAX_ATTEMPTS) {
      await pool.query("DELETE FROM password_resets WHERE email = $1", [normalizedEmail]);
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
    }

    const isValid = await verifyOtp(String(otp).trim(), record.otp_hash);
    if (!isValid) {
      await pool.query(
        "UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE email = $1",
        [normalizedEmail]
      );
      return res.status(400).json({ message: "Invalid code" });
    }

    // OTP confirmed — issue a short-lived token scoped only to resetting this email's password.
    // The OTP row is consumed now so it can't be reused even if the token isn't.
    await pool.query("DELETE FROM password_resets WHERE email = $1", [normalizedEmail]);

    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: "password_reset" },
      JWT_SECRET,
      { expiresIn: RESET_TOKEN_TTL }
    );

    res.status(200).json({ message: "Code verified", resetToken });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// Step 3: set the new password using the reset token
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Reset link is invalid or has expired. Please start again." });
    }

    if (payload.purpose !== "password_reset" || !payload.email) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
      [passwordHash, payload.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ message: "Password has been reset. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Could not reset password", error: err.message });
  }
});

module.exports = router;