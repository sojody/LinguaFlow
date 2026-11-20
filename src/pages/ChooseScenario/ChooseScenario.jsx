
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChooseScenario.css";

function ChooseScenario() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    {
      id: 1,
      icon: "☕",
      title: "At the Coffee Shop",
      description: "Practice ordering coffee and talking with the barista.",
      level: "Beginner",
      duration: "5-10 min",
    },
    {
      id: 2,
      icon: "✈️",
      title: "At the Airport",
      description: "Learn how to communicate during your travel.",
      level: "Intermediate",
      duration: "10-15 min",
    },
    {
      id: 3,
      icon: "🛍️",
      title: "Shopping",
      description: "Practice asking about prices and buying products.",
      level: "Beginner",
      duration: "5-10 min",
    },
    {
      id: 4,
      icon: "🏨",
      title: "At the Hotel",
      description: "Learn how to book a room and talk to hotel staff.",
      level: "Intermediate",
      duration: "10-15 min",
    },
    {
      id: 5,
      icon: "💼",
      title: "Job Interview",
      description: "Prepare yourself for professional conversations.",
      level: "Advanced",
      duration: "15-20 min",
    },
    {
      id: 6,
      icon: "👋",
      title: "Daily Conversation",
      description: "Practice everyday conversations with confidence.",
      level: "Beginner",
      duration: "5-10 min",
    },
  ];

  const handleStart = () => {
    if (!selectedScenario) return;

    navigate("/conversation", {
      state: {
        scenario: scenarios.find(
          (item) => item.id === selectedScenario
        ),
      },
    });
  };

  return (
    <div className="choose-scenario-page">
      <div className="scenario-header">
        <span className="scenario-badge">AI CONVERSATION PRACTICE</span>
        <h1>Choose Your Scenario</h1>
        <p>
          Select a real-life situation and practice speaking
          English with your AI conversation partner.
        </p>
      </div>

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`scenario-card ${
              selectedScenario === scenario.id ? "selected" : ""
            }`}
            onClick={() => setSelectedScenario(scenario.id)}
          >
            <div className="scenario-card-top">
              <div className="scenario-icon">{scenario.icon}</div>
              {selectedScenario === scenario.id && (
                <span className="selected-check">✓</span>
              )}
            </div>

            <h3>{scenario.title}</h3>
            <p>{scenario.description}</p>

            <div className="scenario-meta">
              <span>{scenario.level}</span>
              <span>⏱ {scenario.duration}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="scenario-footer">
        <p>
          {selectedScenario
            ? "Great choice! You're ready to start."
            : "Choose a scenario to get started."}
        </p>

        <button
          className="scenario-start-btn"
          onClick={handleStart}
          disabled={!selectedScenario}
        >
          Start Conversation <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default ChooseScenario;
