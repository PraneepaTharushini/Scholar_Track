import { useState } from "react";
import "../global.css";
import { api } from "../services/api";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetFormState = () => {
    setName("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setMessage("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetFormState();
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "register" && !name) {
      setError("Please enter your name.");
      return;
    }

    if ((mode === "register" || mode === "forgot") && !confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if ((mode === "register" || mode === "forgot") && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await api.login(email, password);
        api.setToken(result.token);
        if (onLogin) onLogin(result.user);
        return;
      }

      if (mode === "register") {
        const result = await api.register(name, email, password, confirmPassword);
        api.setToken(result.token);
        if (onLogin) onLogin(result.user);
        return;
      }

      const result = await api.forgotPassword(email, password, confirmPassword);
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setMessage(result.message || "Password reset successful. Please sign in.");
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
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-logo">
            <div className="login-logo-icon">✓</div>
            <span className="login-logo-text">Scholar Track</span>
          </div>

          <div>
            <h1 className="login-hero-heading">Your Academic<br />Journey, Organized.</h1>
            <p className="login-hero-sub">
              Track tasks, review extracted assignments, and stay on top of every deadline - all in one place.
            </p>
          </div>

          <div className="login-features">
            {["Smart deadline tracking", "Analytics & progress insights", "Review & manage tasks"].map((feature, index) => (
              <div key={index} className="login-feature-item">
                <div className="login-feature-dot" />
                <span className="login-feature-text">{feature}</span>
              </div>
            ))}
          </div>

          <div className="login-version">v1.0.0</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-card">
          <div>
            <h2 className="login-form-title">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create an account" : "Reset password"}
            </h2>
            <p className="login-form-sub">
              {mode === "login"
                ? "Sign in to your student account"
                : mode === "register"
                  ? "Join Scholar Track for free"
                  : "Create a new password for your account"}
            </p>
          </div>

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-error">{message}</div>}

          {mode === "register" && (
            <div className="field">
              <label className="field-label">Full Name</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

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

          <div className="field">
            <div className="login-label-row">
              <label className="field-label">Password</label>
              {mode === "login" && (
                <span className="login-link" onClick={() => switchMode("forgot")}>
                  Forgot password?
                </span>
              )}
            </div>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "login" ? "Enter your password" : "At least 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          {(mode === "register" || mode === "forgot") && (
            <div className="field">
              <label className="field-label">Confirm Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  className="login-input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span className="login-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? "🙈" : "👁"}
                </span>
              </div>
            </div>
          )}

          <button className="login-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? (mode === "login" ? "Signing in..." : mode === "register" ? "Creating account..." : "Resetting password...")
              : (mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Reset Password")}
          </button>

          <p className="login-signup-text" style={{ textAlign: "center", marginTop: "1rem" }}>
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <span className="login-link" onClick={() => switchMode("register")}>
                  Create one free
                </span>
              </>
            ) : mode === "register" ? (
              <>Already have an account?{" "}
                <span className="login-link" onClick={() => switchMode("login")}>
                  Sign in
                </span>
              </>
            ) : (
              <>Remember your password?{" "}
                <span className="login-link" onClick={() => switchMode("login")}>
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
