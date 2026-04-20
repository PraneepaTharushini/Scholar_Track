import { useState } from "react";
import "../global.css";

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive }) => {
  const links = [
    { id: "dashboard",     label: "Dashboard",        icon: "⊞" },
    { id: "upload",        label: "Upload Documents",  icon: "⬆" },
    { id: "review",        label: "Review Tasks",      icon: "✓" },
    { id: "tasks",         label: "Tasks",             icon: "≡" },
    { id: "calendar",      label: "Calendar",          icon: "📅" },
    { id: "analytics",     label: "Analytics",         icon: "↗" },
    { id: "notifications", label: "Notifications",     icon: "🔔" },
    { id: "systeminfo",    label: "System Info",       icon: "ℹ" },
    { id: "settings",      label: "Settings",          icon: "⚙" },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✓</div>
        <span className="sidebar-logo-text">Scholar Track</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <div
            key={l.id}
            className={`nav-item ${active === l.id ? "active" : ""}`}
            onClick={() => setActive(l.id)}
          >
            <span className="nav-icon">{l.icon}</span>
            <span>{l.label}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar-version">v1.0.0</div>
    </div>
  );
};

// ─── HEADER ──────────────────────────────────────────────────────────────────
const Header = ({ title, onProfileClick }) => (
  <div className="page-header">
    <h1 className="page-header-title">{title}</h1>
    <div className="header-right">
      <button className="header-bell">🔔</button>
      <div className="header-avatar" onClick={onProfileClick}>S</div>
      <div>
        <div className="header-name">Sarah</div>
        <div className="header-role">Student</div>
      </div>
      <span style={{ color: "#94a3b8" }}>▾</span>
    </div>
  </div>
);

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@university.edu",
    studentId: "STU-2024-8821",
    university: "State University",
    major: "Computer Science",
    year: "3rd Year",
    bio: "Passionate CS student focused on AI and machine learning.",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, name, type = "text" }) => (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="profile-page">

      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">S</div>
          <div className="profile-avatar-badge">✏</div>
        </div>
        <div>
          <h2 className="profile-name">{form.firstName} {form.lastName}</h2>
          <p className="profile-sub">{form.major} · {form.year}</p>
          <p className="profile-sub2">{form.university}</p>
        </div>
        <div className="profile-stat-row">
          {[["12", "Tasks Done"], ["3", "Pending"], ["94%", "On-Time Rate"]].map(([val, lbl]) => (
            <div key={lbl} className="profile-stat">
              <div className="profile-stat-val">{val}</div>
              <div className="profile-stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="card">
        <h3 className="card-title">Personal Information</h3>
        <div className="grid-2">
          <Field label="First Name"   name="firstName" />
          <Field label="Last Name"    name="lastName" />
          <Field label="Email Address" name="email" type="email" />
          <Field label="Student ID"   name="studentId" />
          <Field label="University / Institution" name="university" />
          <Field label="Major / Program" name="major" />
        </div>

        <div className="field">
          <label className="field-label">Academic Year</label>
          <select
            className="field-select"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          >
            {["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Bio</label>
          <textarea
            className="field-textarea"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div className="profile-actions">
          <button className="btn-outline">Cancel</button>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: "#fecaca" }}>
        <h3 className="card-title" style={{ color: "#dc2626" }}>Danger Zone</h3>
        <div className="danger-row">
          <div>
            <div className="danger-label">Delete Account</div>
            <div className="danger-sub">Permanently remove your account and all associated data.</div>
          </div>
          <button className="btn-danger">Delete Account</button>
        </div>
      </div>

    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage() {
  const [notif, setNotif] = useState({ email: true, push: false, deadlineReminder: true, weeklyDigest: false });
  const [prefs, setPrefs] = useState({ theme: "Light", language: "English", timezone: "UTC+5:30", dateFormat: "MM/DD/YYYY" });
  const [privacy, setPrivacy] = useState({ shareAnalytics: true, publicProfile: false });

  const Toggle = ({ val, onChange }) => (
    <div
      className="toggle"
      style={{ backgroundColor: val ? "#6c63ff" : "#e2e8f0" }}
      onClick={() => onChange(!val)}
    >
      <div className="toggle-thumb" style={{ transform: val ? "translateX(20px)" : "translateX(2px)" }} />
    </div>
  );

  const Row = ({ label, sub, val, onChange }) => (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        {sub && <div className="settings-row-sub">{sub}</div>}
      </div>
      <Toggle val={val} onChange={onChange} />
    </div>
  );

  return (
    <div className="settings-page">

      {/* Notifications */}
      <div className="card">
        <h3 className="card-title">🔔 Notifications</h3>
        <Row label="Email Notifications"  sub="Receive task summaries to your email"          val={notif.email}            onChange={(v) => setNotif({ ...notif, email: v })} />
        <Row label="Push Notifications"   sub="Browser push alerts for upcoming deadlines"    val={notif.push}             onChange={(v) => setNotif({ ...notif, push: v })} />
        <Row label="Deadline Reminders"   sub="Get reminded 24h before a task is due"         val={notif.deadlineReminder} onChange={(v) => setNotif({ ...notif, deadlineReminder: v })} />
        <Row label="Weekly Digest"        sub="Summary of your week every Monday morning"     val={notif.weeklyDigest}     onChange={(v) => setNotif({ ...notif, weeklyDigest: v })} />
      </div>

      {/* Preferences */}
      <div className="card">
        <h3 className="card-title">🎨 Preferences</h3>
        <div className="grid-2">
          {[
            ["Theme",       "theme",      ["Light", "Dark", "System"]],
            ["Language",    "language",   ["English", "Sinhala", "Tamil"]],
            ["Timezone",    "timezone",   ["UTC+0", "UTC+5:30", "UTC+8", "UTC-5"]],
            ["Date Format", "dateFormat", ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]],
          ].map(([label, key, options]) => (
            <div className="field" key={key}>
              <label className="field-label">{label}</label>
              <select className="field-select" value={prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.value })}>
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* OCR & AI */}
      <div className="card">
        <h3 className="card-title">🤖 OCR & AI Settings</h3>
        <div className="info-box">
          <span style={{ flexShrink: 0, fontWeight: 700 }}>ℹ</span>
          <span>These settings control how Scholar Track processes your uploaded documents.</span>
        </div>
        <div className="grid-2">
          {[
            ["Default Priority", ["Low", "Medium", "High"]],
            ["Default Category", ["Project", "Assignment", "Exam", "Reading"]],
          ].map(([label, options]) => (
            <div className="field" key={label}>
              <label className="field-label">{label}</label>
              <select className="field-select">{options.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
          ))}
        </div>
        <div className="field">
          <label className="field-label">Minimum Confidence Threshold</label>
          <div className="slider-wrap">
            <input type="range" min={0} max={100} defaultValue={75} style={{ flex: 1, accentColor: "#6c63ff" }} />
            <span className="slider-val">75%</span>
          </div>
          <span className="field-hint">Tasks below this confidence score will be flagged for manual review.</span>
        </div>
      </div>

      {/* Privacy */}
      <div className="card">
        <h3 className="card-title">🔒 Privacy & Data</h3>
        <Row label="Share Anonymous Analytics" sub="Help improve Scholar Track by sharing usage data" val={privacy.shareAnalytics} onChange={(v) => setPrivacy({ ...privacy, shareAnalytics: v })} />
        <Row label="Public Profile"            sub="Allow other students to view your profile"        val={privacy.publicProfile}  onChange={(v) => setPrivacy({ ...privacy, publicProfile: v })} />
        <div className="export-row">
          <div>
            <div className="settings-row-label">Export My Data</div>
            <div className="settings-row-sub">Download all your tasks and account data as a ZIP file.</div>
          </div>
          <button className="btn-outline-purple">Export</button>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h3 className="card-title">🛡 Security</h3>
        {[
          ["Change Password",          "Last changed 3 months ago",                    "Update"],
          ["Two-Factor Authentication","Add an extra layer of security to your account","Enable"],
          ["Active Sessions",          "Manage devices where you're currently signed in","View"],
        ].map(([label, sub, action]) => (
          <div className="sec-row" key={label}>
            <div>
              <div className="settings-row-label">{label}</div>
              <div className="settings-row-sub">{sub}</div>
            </div>
            <button className="btn-outline">{action}</button>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function ProfileSettingsPage() {
  const [activePage, setActivePage] = useState("settings");

  const titles = { profile: "My Profile", settings: "Settings" };
  const title = titles[activePage] || "Dashboard";

  return (
    <div className="app-shell">
      <Sidebar active={activePage} setActive={setActivePage} />
      <div className="main-content">
        <Header title={title} onProfileClick={() => setActivePage("profile")} />
        <div className="page-body">
          {activePage === "profile"   && <ProfilePage />}
          {activePage === "settings"  && <SettingsPage />}
          {activePage !== "profile" && activePage !== "settings" && (
            <div style={{ padding: "40px 32px", color: "#94a3b8", fontSize: 15 }}>
              ← Select a page from the sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
