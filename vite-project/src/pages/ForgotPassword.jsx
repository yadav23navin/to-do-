import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not process request");
        return;
      }

      navigate("/reset-password", { state: { email: trimmedEmail } });
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="panel form-panel login">
        <p className="eyebrow">Forgot password</p>
        <h1>Reset your password</h1>
        <p style={{ marginBottom: "1rem" }}>
          Enter your account email and we'll send you a reset code.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset code"}
          </button>
        </form>
        <p className="auth-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword