import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../App.css";

const RESEND_COOLDOWN_SEC = 60;

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.message || "Verification failed");
        return;
      }

      const resetRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: verifyData.resetToken, newPassword }),
      });
      const resetData = await resetRes.json();

      if (!resetRes.ok) {
        setError(resetData.message || "Could not reset password");
        return;
      }

      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not resend code");
        return;
      }

      setInfo("A new code has been sent to your email");
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="panel form-panel register">
        <p className="eyebrow">Reset password</p>
        <h1>Enter code & new password</h1>
        <p style={{ marginBottom: "1rem" }}>
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="otp">Verification code</label>
          <input
            type="text"
            id="otp"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
          />

          <label htmlFor="newPassword">New password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}
          {info && <p style={{ color: "green" }}>{info}</p>}

          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <button
          type="button"
          className="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          style={{ marginTop: "0.75rem" }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Resending..." : "Resend code"}
        </button>

        <p className="auth-link">
          <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;