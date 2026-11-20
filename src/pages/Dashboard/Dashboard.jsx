import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [wordsCount, setWordsCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [recentWords, setRecentWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const {
          data: userData,
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        const currentUser = userData.user;

        if (!currentUser) {
          throw new Error("User not found");
        }

        setUser(currentUser);

        // Create statistics if they don't exist
        const { error: insertError } = await supabase
          .from("user_stats")
          .upsert(
            { user_id: currentUser.id },
            {
              onConflict: "user_id",
              ignoreDuplicates: true,
            }
          );

        if (insertError) throw insertError;

        // Fetch user's statistics
        const {
          data: statsData,
          error: fetchError,
        } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();

        if (fetchError) throw fetchError;

        setStats(statsData);

        // Count all saved vocabulary items
        const {
          count: totalWords,
          error: countError,
        } = await supabase
          .from("vocabulary_words")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("user_id", currentUser.id);

        if (countError) throw countError;

        setWordsCount(totalWords || 0);

        // Get today's start time
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count items saved today
        const {
          count: dailyCount,
          error: dailyError,
        } = await supabase
          .from("vocabulary_words")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("user_id", currentUser.id)
          .gte("created_at", today.toISOString());

        if (dailyError) throw dailyError;

        setTodayCount(dailyCount || 0);

        // Fetch the latest 5 vocabulary items
        const {
          data: recentData,
          error: recentError,
        } = await supabase
          .from("vocabulary_words")
          .select("id, word, item_type, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        setRecentWords(recentData || []);

      } catch (err) {
        setError(err.message);
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <p className="dashboard-message">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="dashboard-error">Error: {error}</p>;
  }

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Learner";

  const dailyGoal = 5;
  const dailyProgress = Math.min(
    (todayCount / dailyGoal) * 100,
    100
  );

  const learningGoal = 100;
  const learningProgress = Math.min(
    (wordsCount / learningGoal) * 100,
    100
  );

  const statsCards = [
    {
      id: 1,
      icon: "📚",
      title: "Words Learned",
      value: wordsCount,
      detail: "Total saved vocabulary items",
    },
    {
      id: 2,
      icon: "⏱️",
      title: "Learning Hours",
      value: stats?.learning_hours || 0,
      detail: "Hours completed",
    },
    {
      id: 3,
      icon: "🔥",
      title: "Day Streak",
      value: `${stats?.day_streak || 0} Days`,
      detail: "Keep it going!",
    },
    {
      id: 4,
      icon: "🎯",
      title: "Lessons Completed",
      value: stats?.lessons_completed || 0,
      detail: "Total lessons completed",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getItemType = (type) => {
    const types = {
      word: "Word",
      phrase: "Phrase",
      expression: "Expression",
      sentence: "Sentence",
      note: "Note",
    };

    return types[type] || "Vocabulary";
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {userName}! 👋</h1>
          <p>
            Ready to continue your language learning journey?
          </p>
        </div>

        <div className="dashboard-user">
          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{userName}</strong>
            <span>English Learner</span>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <section className="dashboard-banner">
        <div className="banner-content">
          <span>YOUR LEARNING JOURNEY</span>
          <h2>Keep up the great work!</h2>
          <p>
            Every word you learn brings you closer to fluency.
            Continue practicing and reach your goals.
          </p>

          <Link to="/choose-scenario" className="banner-button">
            Start Learning <span>→</span>
          </Link>
        </div>

        <div className="banner-decoration">
          <span>🌟</span>
          <span>📖</span>
          <span>💬</span>
        </div>
      </section>

      {/* Statistics */}
      <section className="dashboard-stats">
        <div className="dashboard-section-heading">
          <h2>Your Statistics</h2>
          <span>All Time</span>
        </div>

        <div className="stats-grid">
          {statsCards.map((stat) => (
            <div className="stat-card" key={stat.id}>
              <div className="stat-card-top">
                <div className="stat-icon">{stat.icon}</div>
                <span className="stat-arrow">↗</span>
              </div>

              <h3>{stat.title}</h3>
              <strong>{stat.value}</strong>
              <p>{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Progress and Daily Goals */}
      <section className="dashboard-bottom">

        <div className="progress-card">
          <div className="dashboard-section-heading">
            <h2>Learning Progress</h2>
            <span>Vocabulary Goal</span>
          </div>

          <div className="progress-info">
            <div>
              <span>Your saved vocabulary</span>
              <h3>{wordsCount} / {learningGoal} Items</h3>
            </div>

            <strong>{Math.round(learningProgress)}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${learningProgress}%` }}
            ></div>
          </div>

          <p>
            Keep saving new words, phrases, and sentences
            to reach your first 100 vocabulary items!
          </p>
        </div>

        <div className="daily-goals">
          <div className="dashboard-section-heading">
            <h2>Daily Goals</h2>
            <span>Today</span>
          </div>

          <div className="goal-item">
            <div className="goal-icon">📚</div>

            <div className="goal-details">
              <strong>Save 5 vocabulary items</strong>

              <span>
                {todayCount} of {dailyGoal} items completed
              </span>

              <div className="goal-track">
                <div
                  className="goal-fill"
                  style={{ width: `${dailyProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {todayCount >= dailyGoal && (
            <p className="goal-success">
              🎉 Great job! You completed today's vocabulary goal!
            </p>
          )}
        </div>

      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <div className="dashboard-section-heading">
          <h2>Recent Activity</h2>
          <span>Latest 5 Items</span>
        </div>

        {recentWords.length === 0 ? (
          <div className="recent-empty">
            <span>📖</span>
            <h3>No activity yet</h3>
            <p>
              Start learning and save your first vocabulary item!
            </p>
            <Link to="/dictionary">
              Explore Dictionary →
            </Link>
          </div>
        ) : (
          <div className="recent-list">
            {recentWords.map((item) => (
              <div className="recent-item" key={item.id}>
                <div className="recent-item-icon">
                  {item.item_type === "word"
                    ? "📘"
                    : item.item_type === "phrase"
                    ? "💬"
                    : item.item_type === "expression"
                    ? "✨"
                    : item.item_type === "sentence"
                    ? "📝"
                    : "📄"}
                </div>

                <div className="recent-item-details">
                  <strong>{item.word}</strong>
                  <span>{getItemType(item.item_type)}</span>
                </div>

                <span className="recent-item-date">
                  {formatDate(item.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Dashboard;




