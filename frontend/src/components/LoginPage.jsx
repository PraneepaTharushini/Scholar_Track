import { useState } from "react";
import "../global.css";
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
    <div className="login-root">

      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-left-inner">

          <div className="login-logo">
            <img src={logoSvg} alt="Scholar Track Logo" className="login-logo-icon" style={{ width: 56, height: 56, objectFit: 'contain' }} />
            <span className="login-logo-text">Scholar Track</span>
          </div>

          <div>
            <h1 className="login-hero-heading">Your Academic<br />Journey, Organized.</h1>
            <p className="login-hero-sub">
              Track tasks, review extracted assignments, and stay on top of every deadline — all in one place.
            </p>
          </div>

          <div className="login-features">
            {["Smart deadline tracking", "Analytics & progress insights", "Review & manage tasks"].map((f, i) => (
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
            <h2 className="login-form-title">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="login-form-sub">
              {mode === "login"
                ? "Sign in to your student account"
                : "Join Scholar Track for free"}
            </p>
          </div>

          {error && <div className="login-error">{error}</div>}

          {/* Name — register only */}
          {mode === "register" && (
            <div className="field">
              <label className="field-label">Full Name</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  className="login-input"
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
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <div className="login-label-row">
              <label className="field-label">Password</label>
              {mode === "login" && (
                <span className="login-link">Forgot password?</span>
              )}
            </div>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          <button className="login-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? (mode === "login" ? "Signing in…" : "Creating account…")
              : (mode === "login" ? "Sign In" : "Create Account")}
          </button>

          <p className="login-signup-text" style={{ textAlign: "center", marginTop: "1rem" }}>
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <span className="login-link" onClick={() => { setMode("register"); setError(""); }}>
                  Create one free
                </span>
              </>
            ) : (
              <>Already have an account?{" "}
                <span className="login-link" onClick={() => { setMode("login"); setError(""); }}>
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
