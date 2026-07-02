import { useState } from "react";
import "../global.css";
import { api } from "../services/api";
import logoSvg from "../assets/logo.svg";

/* ── SVG icon helpers ── */
const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
  </svg>
);

const IconSpinner = () => (
  <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconCheck = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

<<<<<<< HEAD
/* Password match/no-match inline icons */
const IconMatchTick = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const IconMatchCross = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6M9 9l6 6"/>
  </svg>
);

=======
>>>>>>> origin/testProduce
/* ── Forgot-password multi-step sub-component ── */
function ForgotPasswordFlow({ onBack }) {
  // step: 'email' | 'code' | 'done'
  const [step, setStep]                   = useState("email");
  const [email, setEmail]                 = useState("");
  const [code, setCode]                   = useState("");
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState("");
  const [devCode, setDevCode]             = useState("");
  const [focusedField, setFocusedField]   = useState(null);

  /* ── Step 1: Request reset code ── */
  const handleRequestCode = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email.trim().toLowerCase());
      if (res.dev_code) setDevCode(res.dev_code);
      setStep("code");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 2: Submit code + new password ── */
  const handleResetPassword = async () => {
    setError("");
    if (!code.trim())         { setError("Please enter the confirmation code."); return; }
    if (!newPassword)         { setError("Please enter a new password."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsLoading(true);
    try {
      await api.resetPassword(email, code.trim(), newPassword, confirmPassword);
      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") action();
  };

  /* ── Success screen ── */
  if (step === "done") {
    return (
      <div className="login-form-card" style={{ textAlign: "center" }}>
        <div style={{ color: "var(--accent, #4F46E5)", marginBottom: "1rem" }}><IconCheck /></div>
        <h2 className="login-form-title">Password Reset!</h2>
        <p className="login-form-sub" style={{ marginBottom: "1.5rem" }}>
          Your password has been updated successfully. You can now sign in.
        </p>
        <button className="lf-submit-btn" type="button" onClick={onBack}>
          Back to Sign In
        </button>
      </div>
    );
  }

  /* ── Step 2: Enter code + new password ── */
  if (step === "code") {
    return (
      <div className="login-form-card">
        <div className="login-form-header">
          <h2 className="login-form-title">Check Your Email</h2>
          <p className="login-form-sub">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below along with your new password.
          </p>
          {devCode && (
            <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "8px", background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.3)", color: "#a5b4fc", fontSize: "0.85rem" }}>
              <strong>Dev mode — code:</strong> {devCode}
            </div>
          )}
        </div>

        {error && (
          <div className="login-error" role="alert">
            <IconAlert /><span>{error}</span>
          </div>
        )}

        <div className="login-fields">
          {/* Confirmation code */}
          <div className="lf-field">
            <label className="lf-label" htmlFor="reset-code">Confirmation Code <span className="lf-required">*</span></label>
            <div className={`lf-input-wrap ${focusedField === "code" ? "lf-input-wrap--focused" : ""}`}>
              <span className="lf-icon"><IconKey /></span>
              <input
                id="reset-code"
                className="lf-input"
                type="text"
                placeholder="6-digit code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onFocus={() => setFocusedField("code")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => handleKeyDown(e, handleResetPassword)}
              />
            </div>
          </div>

          {/* New password */}
          <div className="lf-field">
            <label className="lf-label" htmlFor="new-password">New Password <span className="lf-required">*</span></label>
            <div className={`lf-input-wrap ${focusedField === "newpwd" ? "lf-input-wrap--focused" : ""}`}>
              <span className="lf-icon"><IconLock /></span>
              <input
                id="new-password"
                className="lf-input lf-input--password"
                type={showNew ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocusedField("newpwd")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => handleKeyDown(e, handleResetPassword)}
              />
              <button type="button" className="lf-eye-btn" onClick={() => setShowNew(!showNew)} aria-label="Toggle password visibility">
                {showNew ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="lf-field">
            <label className="lf-label" htmlFor="confirm-password">Confirm Password <span className="lf-required">*</span></label>
            <div className={`lf-input-wrap ${focusedField === "confirmpwd" ? "lf-input-wrap--focused" : ""}`}>
              <span className="lf-icon"><IconLock /></span>
              <input
                id="confirm-password"
                className="lf-input lf-input--password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirmpwd")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => handleKeyDown(e, handleResetPassword)}
              />
              <button type="button" className="lf-eye-btn" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle password visibility">
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>
        </div>

        <button className="lf-submit-btn" onClick={handleResetPassword} disabled={isLoading} type="button">
          {isLoading ? <><IconSpinner /><span>Resetting…</span></> : <span>Reset Password</span>}
        </button>

        <p className="lf-switch-text">
          Didn't receive a code?{" "}
          <button type="button" className="lf-switch-link" onClick={() => { setStep("email"); setError(""); setCode(""); }}>
            Try again
          </button>
          {" "}or{" "}
          <button type="button" className="lf-switch-link" onClick={onBack}>
            Back to Sign In
          </button>
        </p>
      </div>
    );
  }

  /* ── Step 1: Enter email ── */
  return (
    <div className="login-form-card">
      <div className="login-form-header">
        <h2 className="login-form-title">Forgot Password?</h2>
        <p className="login-form-sub">
          Enter your registered email and we'll send you a reset code.
        </p>
      </div>

      {error && (
        <div className="login-error" role="alert">
          <IconAlert /><span>{error}</span>
        </div>
      )}

      <div className="login-fields">
        <div className="lf-field">
          <label className="lf-label" htmlFor="forgot-email">Email address <span className="lf-required">*</span></label>
          <div className={`lf-input-wrap ${focusedField === "email" ? "lf-input-wrap--focused" : ""}`}>
            <span className="lf-icon"><IconEmail /></span>
            <input
              id="forgot-email"
              className="lf-input"
              type="email"
              placeholder="student@university.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => handleKeyDown(e, handleRequestCode)}
            />
          </div>
        </div>
      </div>

      <button className="lf-submit-btn" onClick={handleRequestCode} disabled={isLoading} type="button">
        {isLoading ? <><IconSpinner /><span>Sending…</span></> : <span>Send Reset Code</span>}
      </button>

      <p className="lf-switch-text">
        Remember your password?{" "}
        <button type="button" className="lf-switch-link" onClick={onBack}>
          Back to Sign In
        </button>
      </p>
    </div>
  );
}

/* ── Main Login/Register page ── */
export default function LoginPage({ onLogin }) {
<<<<<<< HEAD
  const [mode, setMode]                         = useState("login");
  const [showForgot, setShowForgot]             = useState(false);
  const [name, setName]                         = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [error, setError]                       = useState("");
  const [focusedField, setFocusedField]         = useState(null);
=======
  const [mode, setMode]                   = useState("login");
  const [showForgot, setShowForgot]       = useState(false);
  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState("");
  const [focusedField, setFocusedField]   = useState(null);
>>>>>>> origin/testProduce

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all required fields."); return; }
    if (mode === "register" && !name) { setError("Please enter your full name."); return; }
<<<<<<< HEAD
    if (mode === "register" && !confirmPassword) { setError("Please confirm your password."); return; }
    if (mode === "register" && password !== confirmPassword) { setError("Passwords do not match."); return; }
=======
>>>>>>> origin/testProduce

    setIsLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await api.login(email, password);
      } else {
        result = await api.register(name, email, password, confirmPassword);
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

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
<<<<<<< HEAD
    setConfirmPassword("");
=======
>>>>>>> origin/testProduce
  };

  return (
    <div className="login-root">

      {/* ── Left Panel (desktop only) ── */}
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

        {/* ── Forgot Password Flow ── */}
        {showForgot ? (
          <ForgotPasswordFlow onBack={() => setShowForgot(false)} />
        ) : (
          /* ── Form Card ── */
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
<<<<<<< HEAD
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
                    <button
                      type="button"
                      className="lf-forgot"
                      onClick={() => setShowForgot(true)}
                    >
                      Forgot password?
                    </button>
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

              {/* Confirm Password — register only */}
              {mode === "register" && (
                <div className="lf-field">
                  <label className="lf-label" htmlFor="reg-confirm-password">
                    Confirm Password <span className="lf-required">*</span>
                  </label>
                  <div className={`lf-input-wrap ${
                    focusedField === "confirmPassword" ? "lf-input-wrap--focused" : ""
                  }${
                    confirmPassword.length > 0
                      ? password === confirmPassword
                        ? " lf-input-wrap--match"
                        : " lf-input-wrap--no-match"
                      : ""
                  }`}>
                    <span className="lf-icon"><IconLock /></span>
                    <input
                      id="reg-confirm-password"
                      className="lf-input lf-input--password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={handleKeyDown}
                    />
                    {/* Match / No-match indicator */}
                    {confirmPassword.length > 0 && (
                      <span className="lf-match-icon">
                        {password === confirmPassword ? <IconMatchTick /> : <IconMatchCross />}
                      </span>
                    )}
                    <button
                      type="button"
                      className="lf-eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`lf-match-hint ${
                      password === confirmPassword ? "lf-match-hint--ok" : "lf-match-hint--err"
                    }`}>
                      {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>
              )}
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
=======
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
                    <button
                      type="button"
                      className="lf-forgot"
                      onClick={() => setShowForgot(true)}
                    >
                      Forgot password?
                    </button>
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
>>>>>>> origin/testProduce
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
        )}
      </div>
    </div>
  );
}
