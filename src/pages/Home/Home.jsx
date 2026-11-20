

import { Link } from "react-router-dom";
import robot from "../../assets/Waving Futuristic Robot Mascot.png";
import "./Home.css";

function Home() {
  const features = [
    {
      id: 1,
      icon: "💬",
      title: "Real Conversations",
      description:
        "Practice speaking naturally with your AI conversation partner."
    },
    {
      id: 2,
      icon: "⚡",
      title: "Instant Feedback",
      description:
        "Get helpful feedback and improve your language skills faster."
    },
    {
      id: 3,
      icon: "📚",
      title: "Build Vocabulary",
      description:
        "Learn useful words and save them to your personal dictionary."
    }
  ];

  return (
    <main className="home-page">

      <div className="cloud cloud-one"></div>
      <div className="cloud cloud-two"></div>
      <div className="cloud cloud-three"></div>

      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-badge">
            ✨ AI-Powered Language Learning
          </span>

          <h1>
            Speak any language
            <span>10× faster with AI</span>
          </h1>

          <p>
            Practice real conversations, improve your speaking skills,
            and learn new languages with your personal AI language partner.
          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="primary-btn">
              Start learning for free
              <span>→</span>
            </Link>

            <a href="#features" className="secondary-btn">
              Explore features
            </a>

          </div>

          <div className="hero-stats">

            <div>
              <strong>10K+</strong>
              <span>Active Learners</span>
            </div>

            <div>
              <strong>20+</strong>
              <span>Languages</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>AI Practice</span>
            </div>

          </div>

        </div>

        <div className="hero-visual">

          <div className="robot-glow"></div>

          <div className="robot-circle">
            <img src={robot} alt="LinguaFlow AI Robot" />
          </div>

          <div className="floating-card floating-card-top">
            <span>🎯</span>
            <div>
              <strong>Keep Learning!</strong>
              <small>Your progress is amazing</small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span>⭐</span>
            <div>
              <strong>Great Job!</strong>
              <small>You're improving every day</small>
            </div>
          </div>

        </div>

      </section>

      <section className="features-section" id="features">

        <div className="section-heading">
          <span>WHY LINGUAFLOW?</span>

          <h2>Learn languages the smarter way</h2>

          <p>
            Everything you need to become a confident speaker,
            all in one place.
          </p>
        </div>

        <div className="features-grid">

          {features.map((feature) => (
            <div className="feature-card" key={feature.id}>

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

            </div>
          ))}

        </div>

      </section>

      <section className="home-cta">

        <div>
          <span>YOUR LANGUAGE JOURNEY STARTS HERE</span>

          <h2>Ready to speak with confidence?</h2>

          <p>
            Start your learning journey today with LinguaFlow AI.
          </p>
        </div>

        <Link to="/signup" className="primary-btn">
          Get Started <span>→</span>
        </Link>

      </section>

      <footer className="home-footer">
        <p>© 2026 LinguaFlow AI. All rights reserved.</p>
        <span>Learn. Practice. Speak.</span>
      </footer>

    </main>
  );
}

export default Home;



