const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");
const { transporter } = require("../config/mailer");

const router = express.Router();

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/", requireAuth, contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email || !email.trim()) return res.status(400).json({ message: "Email is required" });
    if (!message || !message.trim()) return res.status(400).json({ message: "Message is required" });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
      replyTo: email.trim(),
      subject: `TaskFlow support message from ${name.trim()}`,
      text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
      html: `<p><b>From:</b> ${name.trim()} (${email.trim()})</p><p>${message.trim().replace(/\n/g, "<br>")}</p>`,
    });

    res.status(200).json({ message: "Message sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
});

module.exports = router;