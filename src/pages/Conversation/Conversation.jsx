import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Conversation.css";

function Conversation() {
  const location = useLocation();
  const navigate = useNavigate();

  const scenario = location.state?.scenario || {
    title: "Daily Conversation",
    icon: "👋",
    level: "Beginner",
  };

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [savedMessages, setSavedMessages] = useState([]);
  const [saveError, setSaveError] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello! Welcome to ${scenario.title}. I'm your AI conversation partner. Let's practice English together!`,
      time: "Now",
    },
    {
      id: 2,
      sender: "ai",
      text: "How are you doing today?",
      time: "Now",
    },
  ]);

  // Separate AI reply from grammar correction
  const parseAIResponse = (response) => {
    const correctionRegex =
      /💡\s*\*{0,2}Quick Correction\*{0,2}\s*:?\s*([\s\S]*?)(?=✨\s*\*{0,2}Great job!?|$)/i;

    const greatJobRegex =
      /✨\s*\*{0,2}Great job!?([\s\S]*)/i;

    const correctionMatch = response.match(correctionRegex);
    const greatJobMatch = response.match(greatJobRegex);

    let conversationText = response;
    let correction = null;
    let isCorrect = false;

    if (correctionMatch) {
      correction = correctionMatch[1]
        .replace(/\*\*/g, "")
        .trim();

      conversationText = response
        .replace(correctionMatch[0], "")
        .replace(greatJobRegex, "")
        .trim();
    } else if (greatJobMatch) {
      isCorrect = true;

      conversationText = response
        .replace(greatJobMatch[0], "")
        .trim();
    }

    return {
      conversationText,
      correction,
      isCorrect,
    };
  };

  // Save an AI sentence or corrected sentence to Vocabulary
  const handleSaveToVocabulary = async (item) => {
    if (!item.text || savingId !== null) return;

    setSavingId(item.id);
    setSaveError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in first.");

      // Prefer the corrected sentence when available
      const betterMatch = item.correction?.match(
        /Better\s*:\s*(.+)/i
      );

      const savedText = betterMatch
        ? betterMatch[1].replace(/\*\*/g, "").trim()
        : item.text.trim();

      const itemType = betterMatch ? "sentence" : "phrase";

      if (!savedText) {
        throw new Error("There is no text to save.");
      }

      // Check whether this item is already saved
      const { data: existingItem, error: checkError } =
        await supabase
          .from("vocabulary_words")
          .select("id")
          .eq("user_id", user.id)
          .eq("word", savedText)
          .eq("item_type", itemType)
          .limit(1)
          .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        setSavedMessages((prev) => [...prev, item.id]);
        return;
      }

      const { error: insertError } = await supabase
        .from("vocabulary_words")
        .insert({
          user_id: user.id,
          word: savedText,
          meaning: `Learned during ${scenario.title} conversation`,
          type: "Other",
          level: scenario.level || "Beginner",
          example: item.text,
          item_type: itemType,
        });

      if (insertError) throw insertError;

      setSavedMessages((prev) => [...prev, item.id]);
    } catch (error) {
      console.error("Save Error:", error);
      setSaveError(error.message || "Could not save this item.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSend = async () => {
    const userMessage = message.trim();

    if (!userMessage || isSending) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: userMessage,
      time: "Now",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsSending(true);
    setSaveError("");

    try {
      const history = messages.map((item) => ({
        role: item.sender === "ai" ? "assistant" : "user",
        content: item.text,
      }));

      const { data, error } = await supabase.functions.invoke(
        "ai-chat",
        {
          body: {
            message: userMessage,
            scenario: scenario,
            history: history,
          },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.reply) {
        throw new Error("AI response is empty.");
      }

      const parsedResponse = parseAIResponse(data.reply);

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: parsedResponse.conversationText,
        correction: parsedResponse.correction,
        isCorrect: parsedResponse.isCorrect,
        time: "Now",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);

      if (error.context) {
        const errorDetails = await error.context
          .clone()
          .json()
          .catch(() => null);

        console.error("AI Error Details:", errorDetails);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Sorry! Something went wrong. Please try again.",
          time: "Now",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="conversation-page">
      <header className="conversation-header">
        <button
          className="back-button"
          onClick={() => navigate("/choose-scenario")}
        >
          ← Back
        </button>

        <div className="conversation-title">
          <div className="conversation-scenario-icon">
            {scenario.icon}
          </div>

          <div>
            <h2>{scenario.title}</h2>
            <span>AI English Practice • {scenario.level}</span>
          </div>
        </div>

        <div className="ai-status">
          <span></span>
          AI Partner
        </div>
      </header>

      <main className="conversation-main">
        <div className="conversation-welcome">
          <div className="ai-avatar">🤖</div>
          <h2>Let's Start Talking!</h2>
          <p>
            Don't be afraid of making mistakes. Practice makes
            progress!
          </p>
        </div>

        <div className="chat-messages">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`message-row ${item.sender}`}
            >
              {item.sender === "ai" && (
                <div className="message-avatar">🤖</div>
              )}

              <div className="message-content">
                {item.text && (
                  <div className="message-bubble">
                    {item.text}
                  </div>
                )}

                {item.correction && (
                  <div className="correction-card">
                    <div className="correction-title">
                      <span>💡</span>
                      <strong>Quick Correction</strong>
                    </div>

                    {item.correction
                      .split("\n")
                      .map((line, index) => {
                        const trimmedLine = line.trim();

                        if (!trimmedLine) return null;

                        const separatorIndex =
                          trimmedLine.indexOf(":");

                        if (separatorIndex === -1) {
                          return (
                            <div
                              className="correction-line"
                              key={index}
                            >
                              {trimmedLine}
                            </div>
                          );
                        }

                        const label = trimmedLine
                          .slice(0, separatorIndex)
                          .trim();

                        const value = trimmedLine
                          .slice(separatorIndex + 1)
                          .trim();

                        return (
                          <div
                            className="correction-line"
                            key={index}
                          >
                            <strong>{label}:</strong>
                            <span>{value}</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {item.isCorrect && (
                  <div className="correct-feedback">
                    ✨ Great job! Your sentence is correct.
                  </div>
                )}

                {/* Save AI message to Vocabulary */}
                {item.sender === "ai" && item.text && (
                  <div className="save-vocabulary-area">
                    <button
                      className="save-vocabulary-btn"
                      onClick={() => handleSaveToVocabulary(item)}
                      disabled={
                        savingId === item.id ||
                        savedMessages.includes(item.id)
                      }
                    >
                      {savedMessages.includes(item.id)
                        ? "✓ Saved to Vocabulary"
                        : savingId === item.id
                        ? "Saving..."
                        : "＋ Save to Vocabulary"}
                    </button>
                  </div>
                )}

                <span className="message-time">
                  {item.time}
                </span>
              </div>

              {item.sender === "user" && (
                <div className="user-message-avatar">👤</div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="message-row ai">
              <div className="message-avatar">🤖</div>

              <div className="message-content">
                <div className="message-bubble">
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        {saveError && (
          <p className="save-error-message">{saveError}</p>
        )}

        <div className="conversation-input-area">
          <div className="conversation-input-box">
            <input
              type="text"
              placeholder="Type your message in English..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />

            <button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="send-message-btn"
            >
              ➤
            </button>
          </div>

          <p className="input-hint">
            {isSending
              ? "AI is preparing a response..."
              : "Press Enter to send your message"}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Conversation;





