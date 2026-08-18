import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";
import "../global.css";

const Field = ({ label, name, type = "text", form, setForm }) => (
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

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, onUpdateUser }) {
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const userFirst = nameParts[0] || (user ? "" : "Sarah");
  const userLast = nameParts.slice(1).join(" ") || (user ? "" : "Johnson");

  const [form, setForm] = useState(() => {
    const savedDetails = user?.id ? localStorage.getItem(`scholar_track_profile_details_${user.id}`) : null;
    const details = savedDetails ? JSON.parse(savedDetails) : {};
    
    return {
      firstName: userFirst,
      lastName: userLast,
      email: user?.email || (user ? "" : "sarah.johnson@university.edu"),
      studentId: user?.id ? `STU-2026-${user.id.toString().padStart(4, '0')}` : "STU-2024-8821",
      university: details.university || "State University",
      major: details.major || "Computer Science",
      year: details.year || "3rd Year",
      bio: details.bio || "Passionate CS student focused on AI and machine learning.",
    };
  });
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => user?.id ? localStorage.getItem('scholar_track_avatar_' + user.id) : null);

  const handleSave = async () => {
    try {
      const updatedName = `${form.firstName} ${form.lastName}`.trim();
      const updatedEmail = form.email;

      // Persist the name and email changes to backend database
      await api.updateMe(updatedName, updatedEmail);

      if (user?.id) {
        localStorage.setItem(`scholar_track_profile_details_${user.id}`, JSON.stringify({
          university: form.university,
          major: form.major,
          year: form.year,
          bio: form.bio
        }));
      }
      
      if (onUpdateUser) {
        onUpdateUser({
          name: updatedName,
          email: updatedEmail
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setAvatarUrl(dataUrl);
        if (user?.id) {
          localStorage.setItem('scholar_track_avatar_' + user.id, dataUrl);
          window.dispatchEvent(new Event('avatarUpdate'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setAvatarUrl(null);
    if (user?.id) {
      localStorage.removeItem('scholar_track_avatar_' + user.id);
      window.dispatchEvent(new Event('avatarUpdate'));
    }
  };

  return (
    <div className="profile-page">

      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="profile-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="profile-avatar">{(form.firstName || "S")[0].toUpperCase()}</div>
          )}
        </div>
        <div>
          <h2 className="profile-name">{form.firstName} {form.lastName}</h2>
          <p className="profile-sub">{form.major} · {form.year}</p>
          <p className="profile-sub2" style={{ marginBottom: '12px' }}>{form.university}</p>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="btn-outline-purple" 
              onClick={() => document.getElementById('avatar-input').click()}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Upload Photo
            </button>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            {avatarUrl && (
              <button 
                className="btn-danger" 
                onClick={handleRemoveAvatar}
                style={{ padding: '6px 12px', fontSize: '12.5px' }}
              >
                Remove Photo
              </button>
            )}
          </div>
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
          <Field label="First Name"   name="firstName" form={form} setForm={setForm} />
          <Field label="Last Name"    name="lastName" form={form} setForm={setForm} />
          <Field label="Email Address" name="email" type="email" form={form} setForm={setForm} />
          <Field label="Student ID"   name="studentId" form={form} setForm={setForm} />
          <Field label="University / Institution" name="university" form={form} setForm={setForm} />
          <Field label="Major / Program" name="major" form={form} setForm={setForm} />
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
      <div className="card" style={{ borderColor: "var(--danger)" }}>
        <h3 className="card-title" style={{ color: "var(--danger)" }}>Danger Zone</h3>
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

const Toggle = ({ val, onChange }) => (
  <div
    className={`custom-toggle ${val ? "on" : ""}`}
    onClick={() => onChange(!val)}
  >
    <div className="custom-toggle-thumb" style={{ transform: val ? "translateX(20px)" : "translateX(0)" }} />
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

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage() {
  const [notif, setNotif] = useState({ email: true, push: false, deadlineReminder: true, weeklyDigest: false });
  const { theme, toggleTheme } = useTheme();
  const [privacy, setPrivacy] = useState({ shareAnalytics: true, publicProfile: false });

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
        <div className="field" style={{ maxWidth: '300px' }}>
          <label className="field-label">Theme</label>
          <select 
            className="field-select" 
            value={theme === "dark" ? "Dark" : "Light"} 
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              if (val !== theme) {
                toggleTheme();
              }
            }}
          >
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
          </select>
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
            <input type="range" min={0} max={100} defaultValue={75} style={{ flex: 1, accentColor: "var(--primary)" }} />
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

// ─── PRIVILEGES PAGE ─────────────────────────────────────────────────────────
function PrivilegesPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.getUsers();
        setUsers(res.users || []);
      } catch (err) {
        setError(err.message || "Failed to load users list.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleTogglePrivilege = async (targetUser) => {
    const targetId = targetUser.id;
    const targetRole = (targetUser.role || "").toLowerCase();
    const currentIsPrivileged = targetRole === "privileged" || targetRole === "admin";
    const newPrivilege = !currentIsPrivileged;

    try {
      setError("");
      const res = await api.updateUserPrivilege(targetId, newPrivilege);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, role: res.user.role } : u))
      );
    } catch (err) {
      setError(err.message || "Failed to update user privilege.");
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="settings-page" style={{ padding: '24px' }}>
      <div className="card">
        <h3 className="card-title">🛡️ Manage Privileges</h3>
        <p className="field-hint" style={{ marginBottom: '16px' }}>
          Grant or revoke privilege access to user accounts. Privileged users can view the Analytics page and manage other users' privileges.
        </p>

        {error && (
          <div className="login-error" role="alert" style={{ marginBottom: '16px' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="field" style={{ marginBottom: '20px' }}>
          <input
            className="field-input"
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Loading users list...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Privilege Access</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const targetRole = (u.role || "").toLowerCase();
                  const isPrivileged = targetRole === "privileged" || targetRole === "admin";
                  const isAdmin = targetRole === "admin";
                  
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        {u.name} {isSelf && <span style={{ fontSize: '11px', color: 'var(--primary)', fontStyle: 'italic' }}>(You)</span>}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.15)' : targetRole === 'privileged' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                          color: isAdmin ? 'rgb(239, 68, 68)' : targetRole === 'privileged' ? 'var(--primary)' : 'var(--text-secondary)'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          className={isPrivileged ? "btn-primary" : "btn-outline"}
                          disabled={isSelf || isAdmin}
                          onClick={() => handleTogglePrivilege(u)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            opacity: (isSelf || isAdmin) ? 0.5 : 1,
                            cursor: (isSelf || isAdmin) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isPrivileged ? "Revoke Privilege" : "Grant Privilege"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>No users found matching "{search}"</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function ProfileSettingsPage({ user, onUpdateUser }) {
  const [activePage, setActivePage] = useState("profile");
  const userRole = (user?.role || 'student').toLowerCase();
  const isPrivilegedUser = userRole === 'privileged' || userRole === 'admin';

  const tabs = [["profile", "My Profile"], ["settings", "Settings"]];
  if (isPrivilegedUser) {
    tabs.push(["privileges", "Manage Privileges"]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-nav tabs */}
      <div className="profile-settings-nav">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activePage === id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activePage === id ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activePage === id ? 700 : 500,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'var(--transition)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ overflow: 'auto', flex: 1 }}>
        {activePage === "profile"  && <ProfilePage user={user} onUpdateUser={onUpdateUser} />}
        {activePage === "settings" && <SettingsPage />}
        {activePage === "privileges" && isPrivilegedUser && <PrivilegesPage currentUser={user} />}
      </div>
    </div>
  );
}
