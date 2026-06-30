import { useEffect, useState } from "react";
import "../global.css";
import { api } from "../services/api";
import logoSvg from "../assets/logo.svg";

/* ── SVG icon helpers ── */
const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconSpinner = () => (
  <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (mode === "forgot" && resetStep === "request") {
      await requestResetCode();
      return;
    }

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

    if (mode === "forgot" && !code) {
      setError("Please enter the confirmation code from your email.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await api.login(email, password);
        api.setToken(result.token);
        onLogin?.(result.user);
      } else if (mode === "register") {
        const result = await api.register(name, email, password, confirmPassword);
        api.setToken(result.token);
        onLogin?.(result.user);
      } else {
        const result = await api.resetPassword(email, code, password, confirmPassword);
        switchMode("login");
        setMessage(result.message || "Password reset successful. Please sign in.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const title = mode === "login" ? "Welcome back" : mode === "register" ? "Create an account" : "Reset password";
  const subtitle = mode === "login"
    ? "Sign in to your student account"
    : mode === "register"
      ? "Join Scholar Track for free"
      : resetStep === "request"
        ? "Send a confirmation code to your email"
        : "Enter the emailed code and create a new password";

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

        {/* Mobile-only header banner */}
        <div className="login-mobile-header">
          <div className="login-mobile-brand">
            <img src={logoSvg} alt="Scholar Track Logo" width="52" height="52" style={{ objectFit: 'contain' }} />
            <span className="login-mobile-brand-name">Scholar Track</span>
          </div>
          <p className="login-mobile-tagline">Your Academic Journey, Organized.</p>
          <div className="login-mobile-blob login-mobile-blob--1" />
          <div className="login-mobile-blob login-mobile-blob--2" />
        </div>

        {/* ── Form Card ── */}
        <div className="login-form-card">

          {/* Mode tabs */}
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === "login" ? "login-tab--active" : ""}`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`login-tab ${mode === "register" ? "login-tab--active" : ""}`}
              onClick={() => switchMode("register")}
              type="button"
            >
              Create Account
            </button>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">
              {mode === "login" ? "Welcome back" : "Join Scholar Track"}
            </h2>
            <p className="login-form-sub">
              {mode === "login"
                ? "Sign in to continue your academic journey"
                : "Create your free account to get started"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          <div className="login-fields">
            {/* Full Name — register only */}
            {mode === "register" && (
              <div className="lf-field">
                <label className="lf-label" htmlFor="reg-name">Full Name <span className="lf-required">*</span></label>
                <div className={`lf-input-wrap ${focusedField === "name" ? "lf-input-wrap--focused" : ""}`}>
                  <span className="lf-icon"><IconUser /></span>
                  <input
                    id="reg-name"
                    className="lf-input"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="lf-field">
              <label className="lf-label" htmlFor="login-email">Email address <span className="lf-required">*</span></label>
              <div className={`lf-input-wrap ${focusedField === "email" ? "lf-input-wrap--focused" : ""}`}>
                <span className="lf-icon"><IconEmail /></span>
                <input
                  id="login-email"
                  className="lf-input"
                  type="email"
                  placeholder="student@university.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Password */}
            <div className="lf-field">
              <div className="lf-label-row">
                <label className="lf-label" htmlFor="login-password">Password <span className="lf-required">*</span></label>
                {mode === "login" && (
                  <button type="button" className="lf-forgot">Forgot password?</button>
                )}
              </div>
              <div className={`lf-input-wrap ${focusedField === "password" ? "lf-input-wrap--focused" : ""}`}>
                <span className="lf-icon"><IconLock /></span>
                <input
                  id="login-password"
                  className="lf-input lf-input--password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="lf-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {mode === "register" && (
                <p className="lf-hint">Use 8+ characters with a mix of letters and numbers.</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            className="lf-submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <IconSpinner />
                <span>{mode === "login" ? "Signing in…" : "Creating account…"}</span>
              </>
            ) : (
              <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
            )}
          </button>

          {/* Switch mode */}
          <p className="lf-switch-text">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button type="button" className="lf-switch-link" onClick={() => switchMode("register")}>
                  Create one free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button type="button" className="lf-switch-link" onClick={() => switchMode("login")}>
                  Sign in
                </button>
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  );
}
