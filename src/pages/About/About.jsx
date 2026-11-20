
import { Link } from "react-router-dom";
import robot from "../../assets/Waving Futuristic Robot Mascot.png";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-tag">ABOUT LINGUAFLOW AI</span>

          <h1>
            Learn Languages.
            <span> Speak with Confidence.</span>
          </h1>

          <p>
            LinguaFlow AI is your smart language learning companion.
            Practice real-life conversations, build your vocabulary,
            and improve your speaking skills step by step.
          </p>

          <Link to="/signup" className="about-btn">
            Start Learning →
          </Link>
        </div>

        <div className="about-hero-image">
          <img src={robot} alt="LinguaFlow AI Robot" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="mission-card">
          <div className="mission-icon">🎯</div>
          <h2>Our Mission</h2>
          <p>
            Our mission is to make language learning easier,
            more enjoyable, and accessible to everyone through
            interactive practice and smart learning tools.
          </p>
        </div>

        <div className="mission-card">
          <div className="mission-icon">🚀</div>
          <h2>Our Vision</h2>
          <p>
            We believe that everyone should have the confidence
            to communicate with people around the world.
            We aim to make that possible through technology.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <div className="about-section-heading">
          <span>WHAT WE OFFER</span>
          <h2>Everything You Need to Improve</h2>
          <p>
            Explore the tools that make your learning journey easier.
          </p>
        </div>

        <div className="about-features-grid">

          <div className="about-feature-card">
            <div className="feature-icon">💬</div>
            <h3>Conversation Practice</h3>
            <p>
              Practice everyday conversations through different
              real-life scenarios.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="feature-icon">📚</div>
            <h3>Smart Dictionary</h3>
            <p>
              Discover new words, meanings, translations,
              and useful examples.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="feature-icon">📝</div>
            <h3>Vocabulary Building</h3>
            <p>
              Save and review important words to grow your vocabulary.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>
              Follow your learning journey and celebrate every achievement.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="about-how">
        <div className="about-section-heading">
          <span>YOUR LEARNING JOURNEY</span>
          <h2>How LinguaFlow Works</h2>
          <p>Three simple steps to start your language journey.</p>
        </div>

        <div className="steps-container">

          <div className="about-step">
            <div className="step-number">01</div>
            <h3>Create Your Account</h3>
            <p>Join LinguaFlow and set up your learning profile.</p>
          </div>

          <div className="about-step">
            <div className="step-number">02</div>
            <h3>Choose Your Scenario</h3>
            <p>Select a situation and start practicing conversations.</p>
          </div>

          <div className="about-step">
            <div className="step-number">03</div>
            <h3>Learn and Improve</h3>
            <p>Build your vocabulary and track your progress.</p>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to Start Your Journey?</h2>
        <p>
          Take the first step toward becoming a more confident speaker.
        </p>

        <Link to="/signup" className="about-btn">
          Get Started Now →
        </Link>
      </section>

    </div>
  );
}

export default About;
