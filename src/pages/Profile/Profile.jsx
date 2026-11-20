import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Profile.css";

const defaultProfile = {
  name: "",
  username: "",
  email: "",
  level: "Beginner (A1)",
  nativeLanguage: "Arabic",
  learningLanguage: "English",
  dailyGoal: "30 Minutes",
  bio: "",
};

function Profile() {
  const [user, setUser] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    words: 0,
    streak: 0,
    lessons: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!authUser) {
        setError("Please log in to view your profile.");
        return;
      }

      const metadata = authUser.user_metadata || {};

      setUser({
        name: metadata.full_name || "",
        username: metadata.username || "",
        email: authUser.email || "",
        level: metadata.level || "Beginner (A1)",
        nativeLanguage: metadata.native_language || "Arabic",
        learningLanguage: metadata.learning_language || "English",
        dailyGoal: metadata.daily_goal || "30 Minutes",
        bio: metadata.bio || "",
      });

      const [statsResult, wordsResult] = await Promise.all([
        supabase
          .from("user_stats")
          .select("day_streak, lessons_completed")
          .eq("user_id", authUser.id)
          .maybeSingle(),

        supabase
          .from("vocabulary_words")
          .select("id", { count: "exact", head: true })
          .eq("user_id", authUser.id)
          .eq("item_type", "word"),
      ]);

      if (statsResult.error) throw statsResult.error;
      if (wordsResult.error) throw wordsResult.error;

      setStats({
        words: wordsResult.count || 0,
        streak: Number(statsResult.data?.day_streak || 0),
        lessons: Number(statsResult.data?.lessons_completed || 0),
      });
    } catch (err) {
      console.error("Profile loading error:", err);
      setError("Could not load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setSaved(false);
    setError("");
    fetchProfile();
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const { data, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: user.name.trim(),
            username: user.username.trim(),
            level: user.level,
            native_language: user.nativeLanguage,
            learning_language: user.learningLanguage,
            daily_goal: user.dailyGoal,
            bio: user.bio.trim(),
          },
        });

      if (updateError) throw updateError;

      const metadata = data.user?.user_metadata || {};

      setUser((prev) => ({
        ...prev,
        name: metadata.full_name || prev.name,
        username: metadata.username || prev.username,
        level: metadata.level || prev.level,
        nativeLanguage:
          metadata.native_language || prev.nativeLanguage,
        learningLanguage:
          metadata.learning_language || prev.learningLanguage,
        dailyGoal: metadata.daily_goal || prev.dailyGoal,
        bio: metadata.bio || prev.bio,
      }));

      setEditing(false);
      setSaved(true);
    } catch (err) {
      console.error("Profile saving error:", err);
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page profile-message">
        Loading your profile...
      </div>
    );
  }

  if (error && !user.email) {
    return (
      <div className="profile-page profile-message">
        <p>{error}</p>
        <button onClick={fetchProfile} className="profile-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <span className="profile-badge">YOUR ACCOUNT</span>
          <h1>My Profile 👤</h1>
          <p>
            Manage your personal information and learning preferences.
          </p>
        </div>

        <div className="profile-header-icon">👤</div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar-card">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <h2>{user.name || "Your Name"}</h2>
          <p className="profile-username">
            @{user.username || "username"}
          </p>

          <span className="profile-level-badge">{user.level}</span>

          <div className="profile-sidebar-divider"></div>

          <div className="profile-mini-stat">
            <span>📚 Words Learned</span>
            <strong>{stats.words}</strong>
          </div>

          <div className="profile-mini-stat">
            <span>🔥 Learning Streak</span>
            <strong>{stats.streak} Days</strong>
          </div>

          <div className="profile-mini-stat">
            <span>🎯 Lessons Completed</span>
            <strong>{stats.lessons}</strong>
          </div>
        </div>

        <div className="profile-details-card">
          <div className="profile-details-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Update your personal details below.</p>
            </div>

            <button
              type="button"
              className="profile-edit-btn"
              onClick={() => {
                if (editing) {
                  handleCancel();
                } else {
                  setEditing(true);
                  setSaved(false);
                  setError("");
                }
              }}
              disabled={saving}
            >
              {editing ? "Cancel" : "✏️ Edit Profile"}
            </button>
          </div>

          {saved && (
            <div className="profile-success">
              ✓ Your profile has been updated successfully!
            </div>
          )}

          {error && (
            <div className="profile-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  required
                />
              </div>

              <div className="profile-field">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  required
                />
              </div>

              <div className="profile-field full-width">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  readOnly
                />
                <small className="profile-field-hint">
                  Your email is managed through your account settings.
                </small>
              </div>

              <div className="profile-field">
                <label>Native Language</label>
                <select
                  name="nativeLanguage"
                  value={user.nativeLanguage}
                  onChange={handleChange}
                  disabled={!editing || saving}
                >
                  <option>Arabic</option>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div className="profile-field">
                <label>Learning Language</label>
                <select
                  name="learningLanguage"
                  value={user.learningLanguage}
                  onChange={handleChange}
                  disabled={!editing || saving}
                >
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div className="profile-field">
                <label>Current Level</label>
                <select
                  name="level"
                  value={user.level}
                  onChange={handleChange}
                  disabled={!editing || saving}
                >
                  <option>Beginner (A1)</option>
                  <option>Elementary (A2)</option>
                  <option>Intermediate (B1)</option>
                  <option>Upper Intermediate (B2)</option>
                  <option>Advanced (C1)</option>
                </select>
              </div>

              <div className="profile-field">
                <label>Daily Learning Goal</label>
                <select
                  name="dailyGoal"
                  value={user.dailyGoal}
                  onChange={handleChange}
                  disabled={!editing || saving}
                >
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                  <option>45 Minutes</option>
                  <option>60 Minutes</option>
                </select>
              </div>

              <div className="profile-field full-width">
                <label>About Me</label>
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  rows="4"
                />
              </div>
            </div>

            {editing && (
              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes →"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;

