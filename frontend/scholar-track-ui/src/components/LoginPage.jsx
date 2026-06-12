import { useState } from "react";
import "../global.css";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); if (onLogin) onLogin(); }, 1500);
  };

  return (
    <div className="login-root">

      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-left-inner">

          <div className="login-logo">
            <div className="login-logo-icon">✓</div>
            <span className="login-logo-text">Scholar Track</span>
          </div>

          <div>
            <h1 className="login-hero-heading">Your Academic<br />Journey, Organized.</h1>
            <p className="login-hero-sub">
              Upload syllabi, extract tasks automatically, and stay on top of every deadline — all in one place.
            </p>
          </div>

          <div className="login-features">
            {["OCR + NLP task extraction", "Smart deadline tracking", "Analytics & progress insights"].map((f, i) => (
              <div key={i} className="login-feature-item">
                <div className="login-feature-dot" />
                <span className="login-feature-text">{f}</span>
              </div>
            ))}
          </div>

          <div className="login-version">v1.0.0</div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-form-card">

          <div>
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-sub">Sign in to your student account</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          {/* Email */}
          <div className="field">
            <label className="field-label">Email address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉</span>
              <input
                className="login-input"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <div className="login-label-row">
              <label className="field-label">Password</label>
              <span className="login-link">Forgot password?</span>
            </div>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          <label className="login-check-label">
            <input type="checkbox" style={{ accentColor: "#6c63ff" }} />
            Remember me for 30 days
          </label>

          <button className="login-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign In"}
          </button>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or continue with</span>
            <div className="login-divider-line" />
          </div>

          <div className="login-social-row">
            {["Google", "Microsoft"].map((p) => (
              <button key={p} className="login-social-btn">{p}</button>
            ))}
          </div>

          <p className="login-signup-text">
            Don't have an account? <span className="login-link">Create one free</span>
          </p>

        </div>
      </div>
    </div>
  );
}
