import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Progress.css";

function Progress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    words_learned: 0,
    learning_hours: 0,
    lessons_completed: 0,
    day_streak: 0,
  });
  const [vocabulary, setVocabulary] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setError("Please log in to view your progress.");
        return;
      }

      const [statsResult, vocabularyResult] = await Promise.all([
        supabase
          .from("user_stats")
          .select(
            "words_learned, learning_hours, lessons_completed, day_streak"
          )
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("vocabulary_words")
          .select("id, word, item_type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (statsResult.error) throw statsResult.error;
      if (vocabularyResult.error) throw vocabularyResult.error;

      const words = vocabularyResult.data || [];

      setVocabulary(words);

      setStats({
        words_learned: words.filter(
          (item) => item.item_type === "word"
        ).length,
        learning_hours: Number(statsResult.data?.learning_hours || 0),
        lessons_completed: Number(
          statsResult.data?.lessons_completed || 0
        ),
        day_streak: Number(statsResult.data?.day_streak || 0),
      });
    } catch (err) {
      console.error("Progress error:", err);
      setError("Something went wrong while loading your progress.");
    } finally {
      setLoading(false);
    }
  };

  // Build the last seven days using the user's local calendar.
  const weeklyData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = vocabulary.filter((item) => {
      const createdAt = new Date(item.created_at);
      return createdAt >= date && createdAt < nextDate;
    }).length;

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    };
  });

  const weeklyTotal = weeklyData.reduce(
    (total, item) => total + item.count,
    0
  );

  const maxWeeklyCount = Math.max(
    ...weeklyData.map((item) => item.count),
    1
  );

  const milestoneGoal = 100;
  const milestoneProgress = Math.min(
    (stats.words_learned / milestoneGoal) * 100,
    100
  );

  const achievements = [
    {
      id: 1,
      icon: "🔥",
      title: "7 Day Streak",
      description: "Practice for 7 days in a row",
      unlocked: stats.day_streak >= 7,
    },
    {
      id: 2,
      icon: "📖",
      title: "Word Explorer",
      description: "Learn 100 new words",
      unlocked: stats.words_learned >= 100,
    },
    {
      id: 3,
      icon: "🎯",
      title: "Vocabulary Starter",
      description: "Save 10 vocabulary words",
      unlocked: vocabulary.length >= 10,
    },
    {
      id: 4,
      icon: "🏆",
      title: "Dedicated Learner",
      description: "Complete 30 lessons",
      unlocked: stats.lessons_completed >= 30,
    },
  ];

  const unlockedAchievements = achievements.filter(
    (item) => item.unlocked
  ).length;

  const getActivityDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === today.getTime()) return "Today";
    if (activityDate.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getActivityType = (itemType) => {
    switch (itemType) {
      case "word":
        return { icon: "📚", title: "Vocabulary Practice" };
      case "phrase":
        return { icon: "💬", title: "Phrase Saved" };
      case "expression":
        return { icon: "✨", title: "Expression Saved" };
      case "sentence":
        return { icon: "✍️", title: "Sentence Saved" };
      case "note":
        return { icon: "📝", title: "Note Added" };
      default:
        return { icon: "📖", title: "Learning Activity" };
    }
  };

  const activities = vocabulary.slice(0, 5);

  if (loading) {
    return (
      <div className="progress-page progress-message">
        <p>Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page progress-message">
        <p>{error}</p>
        <button onClick={fetchProgress} className="progress-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-page-header">
        <div>
          <span className="progress-badge">YOUR LEARNING JOURNEY</span>
          <h1>My Progress 📊</h1>
          <p>
            Track your achievements and see how far you've come
            on your language learning journey.
          </p>
        </div>

        <div className="progress-level-box">
          <span>YOUR VOCABULARY</span>
          <strong>{stats.words_learned}</strong>
          <p>Words learned</p>
        </div>
      </div>

      <section className="progress-overview">
        <div className="overview-card">
          <div className="overview-icon">📚</div>
          <span>Words Learned</span>
          <strong>{stats.words_learned}</strong>
          <small>From your saved vocabulary</small>
        </div>

        <div className="overview-card">
          <div className="overview-icon">⏱️</div>
          <span>Learning Hours</span>
          <strong>{stats.learning_hours}</strong>
          <small>Total learning hours</small>
        </div>

        <div className="overview-card">
          <div className="overview-icon">🎯</div>
          <span>Lessons Completed</span>
          <strong>{stats.lessons_completed}</strong>
          <small>Total completed lessons</small>
        </div>

        <div className="overview-card">
          <div className="overview-icon">🔥</div>
          <span>Day Streak</span>
          <strong>{stats.day_streak} Days</strong>
          <small>Keep it going!</small>
        </div>
      </section>

      <section className="progress-main-grid">
        <div className="weekly-progress-card">
          <div className="progress-section-heading">
            <div>
              <h2>Weekly Activity</h2>
              <p>Vocabulary items saved each day</p>
            </div>
            <span className="weekly-total">
              {weeklyTotal} items
            </span>
          </div>

          <div className="weekly-chart">
            {weeklyData.map((item) => (
              <div className="chart-column" key={item.day}>
                <span className="chart-value">{item.count}</span>

                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(item.count / maxWeeklyCount) * 100}%`,
                    }}
                  ></div>
                </div>

                <span className="chart-day">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="level-progress-card">
          <div className="progress-section-heading">
            <div>
              <h2>Vocabulary Milestone</h2>
              <p>Your journey to 100 words</p>
            </div>
            <span className="level-percentage">
              {Math.round(milestoneProgress)}%
            </span>
          </div>

          <div className="level-track">
            <div
              className="level-fill"
              style={{ width: `${milestoneProgress}%` }}
            ></div>
          </div>

          <div className="level-labels">
            <span>{stats.words_learned} words learned</span>
            <span>{milestoneGoal} words</span>
          </div>

          <div className="next-level-box">
            <span>🚀</span>
            <div>
              <strong>
                {stats.words_learned >= milestoneGoal
                  ? "Milestone completed!"
                  : "You're making great progress!"}
              </strong>
              <p>
                {stats.words_learned >= milestoneGoal
                  ? "You've reached your 100-word milestone. Keep learning!"
                  : `Learn ${milestoneGoal - stats.words_learned} more words to reach your milestone.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="progress-bottom-grid">
        <div className="achievements-card">
          <div className="progress-section-heading">
            <div>
              <h2>Achievements</h2>
              <p>Celebrate your learning milestones</p>
            </div>
            <span className="achievement-count">
              {unlockedAchievements} / {achievements.length} Unlocked
            </span>
          </div>

          <div className="achievements-grid">
            {achievements.map((item) => (
              <div
                className={`achievement-item ${
                  item.unlocked ? "unlocked" : "locked"
                }`}
                key={item.id}
              >
                <div className="achievement-icon">{item.icon}</div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <span className="achievement-status">
                  {item.unlocked ? "✓ Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity-card">
          <div className="progress-section-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest saved vocabulary</p>
            </div>
          </div>

          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((item) => {
                const activity = getActivityType(item.item_type);

                return (
                  <div className="activity-item" key={item.id}>
                    <div className="activity-icon">
                      {activity.icon}
                    </div>

                    <div className="activity-info">
                      <strong>{activity.title}</strong>
                      <p>{item.word}</p>
                      <span>{getActivityDate(item.created_at)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-activity">
                <span>📚</span>
                <p>No learning activity yet.</p>
                <small>Save your first word to see it here!</small>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Progress;

