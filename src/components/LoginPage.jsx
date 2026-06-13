import { useState } from "react";
import "../global.css";
import "./LoginPage.css";
import { api } from "../services/api";
import logoSvg from "../assets/logo.svg";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "register" && !name) { setError("Please enter your name."); return; }

    setIsLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await api.login(email, password);
      } else {
        result = await api.register(name, email, password);
      }
      api.setToken(result.token);
      if (onLogin) onLogin(result.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="lp-root">

      {/* ════════════════════════════════════════════════════════
          LEFT PANEL — desktop only (≥ 860px)
      ════════════════════════════════════════════════════════ */}
      <div className="lp-left" aria-hidden="true">
        <div className="lp-left-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <img src={logoSvg} alt="Scholar Track Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <span className="lp-logo-text">Scholar Track</span>
          </div>
          <div>
            <h1 className="lp-hero-heading">Your Academic<br />Journey, Organized.</h1>
            <p className="lp-hero-sub">
              Track tasks, review extracted assignments, and stay on top of every deadline — all in one place.
            </p>
          </div>
          <div className="lp-features">
            {["Smart deadline tracking", "Analytics & progress insights", "Review & manage tasks"].map((f, i) => (
              <div key={i} className="lp-feature-item">
                <div className="lp-feature-dot" />
                <span className="lp-feature-text">{f}</span>
              </div>
            ))}
          </div>
          <span className="lp-version">v1.0.0</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          RIGHT PANEL — always visible
      ════════════════════════════════════════════════════════ */}
      <div className="lp-right">

        {/* Mobile-only brand header (hidden on desktop) */}
        <div className="lp-mobile-brand">
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <img src={logoSvg} alt="Scholar Track Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <span className="lp-logo-text">Scholar Track</span>
          </div>
          <p className="lp-mobile-tagline">Your Academic Journey, Organized.</p>
        </div>

        {/* Form card */}
        <div className="lp-form-card">
          <div className="lp-form-header">
            <h2 className="lp-form-title">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="lp-form-sub">
              {mode === "login"
                ? "Sign in to your student account"
                : "Join Scholar Track for free"}
            </p>
          </div>

          {error && <div className="lp-error">{error}</div>}

          {/* Name — register only */}
          {mode === "register" && (
            <div className="lp-field">
              <label className="lp-label">Full Name</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">👤</span>
                <input
                  className="lp-input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="lp-field">
            <label className="lp-label">Email address</label>
            <div className="lp-input-wrap">
              <span className="lp-input-icon">✉</span>
              <input
                className="lp-input"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Password */}
          <div className="lp-field">
            <div className="lp-label-row">
              <label className="lp-label">Password</label>
              {mode === "login" && (
                <span className="lp-link">Forgot password?</span>
              )}
            </div>
            <div className="lp-input-wrap">
              <span className="lp-input-icon">🔒</span>
              <input
                className="lp-input"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="lp-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button className="lp-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? (mode === "login" ? "Signing in…" : "Creating account…")
              : (mode === "login" ? "Sign In" : "Create Account")}
          </button>

          {/* Switch mode */}
          <p className="lp-switch">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <span className="lp-link" onClick={() => { setMode("register"); setError(""); }}>
                  Create one free
                </span>
              </>
            ) : (
              <>Already have an account?{" "}
                <span className="lp-link" onClick={() => { setMode("login"); setError(""); }}>
                  Sign in
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
