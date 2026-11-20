import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Vocabulary.css";

function Vocabulary() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add new item states
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const initialForm = {
    word: "",
    item_type: "word",
    meaning: "",
    type: "Noun",
    level: "Beginner",
    example: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const filters = ["All", "Beginner", "Intermediate", "Advanced"];

  const itemTypes = [
    { value: "word", label: "Word" },
    { value: "phrase", label: "Phrase" },
    { value: "expression", label: "Expression" },
    { value: "sentence", label: "Sentence" },
    { value: "note", label: "Note" },
  ];

  // Fetch user's vocabulary
  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("vocabulary_words")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setWords(data || []);
    } catch (err) {
      console.error("Fetch Vocabulary Error:", err);
      setError("Unable to load your vocabulary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new item to Supabase
  const addItem = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaveMessage("");

    try {
      const newItem = {
        word: formData.word.trim(),
        item_type: formData.item_type,
        meaning:
          formData.meaning.trim() ||
          (formData.item_type === "note" ? "Personal note" : ""),
        type: formData.item_type === "word" ? formData.type : "Other",
        level: formData.level,
        example: formData.example.trim(),
      };

      const { data, error } = await supabase
        .from("vocabulary_words")
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      setWords((prev) => [data, ...prev]);
      setFormData(initialForm);
      setShowForm(false);
      setSaveMessage("Item added successfully!");

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error("Add Vocabulary Error:", err);
      setSaveMessage("Unable to save this item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const deleteWord = async (id) => {
    const { error } = await supabase
      .from("vocabulary_words")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete Word Error:", error);
      setError("Unable to delete this item.");
      return;
    }

    setWords((prev) => prev.filter((item) => item.id !== id));
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";

    const savedDate = new Date(date);
    const today = new Date();

    if (savedDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (savedDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return savedDate.toLocaleDateString();
  };

  // Search and filter
  const filteredWords = words.filter((item) => {
    const matchesSearch =
      `${item.word || ""} ${item.meaning || ""} ${item.example || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.level === filter;

    return matchesSearch && matchesFilter;
  });

  const getItemLabel = (itemType) => {
    return (
      itemTypes.find((item) => item.value === itemType)?.label || "Word"
    );
  };

  return (
    <div className="vocabulary-page">

      {/* Header */}
      <div className="vocabulary-header">
        <div>
          <span className="vocabulary-badge">
            YOUR PERSONAL COLLECTION
          </span>

          <h1>My Vocabulary 📚</h1>

          <p>
            Save words, phrases, expressions and notes
            to build your English skills.
          </p>
        </div>

        <div className="vocabulary-header-icon">📖</div>
      </div>

      {/* Stats */}
      <div className="vocabulary-stats">

        <div className="vocabulary-stat-card">
          <span>📚</span>
          <div>
            <strong>{words.length}</strong>
            <p>Total Items</p>
          </div>
        </div>

        <div className="vocabulary-stat-card">
          <span>🌱</span>
          <div>
            <strong>
              {words.filter((item) => item.level === "Beginner").length}
            </strong>
            <p>Beginner</p>
          </div>
        </div>

        <div className="vocabulary-stat-card">
          <span>🚀</span>
          <div>
            <strong>
              {words.filter((item) => item.level === "Intermediate").length}
            </strong>
            <p>Intermediate</p>
          </div>
        </div>

        <div className="vocabulary-stat-card">
          <span>🏆</span>
          <div>
            <strong>
              {words.filter((item) => item.level === "Advanced").length}
            </strong>
            <p>Advanced</p>
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="vocabulary-toolbar">

        <div className="vocabulary-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search your vocabulary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="vocabulary-filters">
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

      </div>

      {/* Add New Button */}
      <div className="vocabulary-add-section">
        <button
          className="add-vocabulary-btn"
          onClick={() => {
            setShowForm(!showForm);
            setSaveMessage("");
          }}
        >
          {showForm ? "✕ Close" : "+ Add New"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form className="vocabulary-add-form" onSubmit={addItem}>

          <h2>Add New Item ✨</h2>

          <div className="vocabulary-form-grid">

            <div className="vocabulary-form-group">
              <label>Item Type</label>
              <select
                name="item_type"
                value={formData.item_type}
                onChange={handleChange}
              >
                {itemTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="vocabulary-form-group">
              <label>Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="vocabulary-form-group full-width">
              <label>
                {formData.item_type === "note"
                  ? "Your Note"
                  : formData.item_type === "word"
                  ? "Word"
                  : formData.item_type === "phrase"
                  ? "Phrase"
                  : formData.item_type === "expression"
                  ? "Expression"
                  : "Sentence"}
              </label>

              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleChange}
                placeholder="Write here..."
                required
              />
            </div>

            {formData.item_type === "word" && (
              <div className="vocabulary-form-group">
                <label>Word Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Noun">Noun</option>
                  <option value="Verb">Verb</option>
                  <option value="Adjective">Adjective</option>
                  <option value="Adverb">Adverb</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div className="vocabulary-form-group full-width">
              <label>
                Meaning / Translation
                {formData.item_type === "note" ? " (Optional)" : ""}
              </label>

              <input
                type="text"
                name="meaning"
                value={formData.meaning}
                onChange={handleChange}
                placeholder="Write the meaning or translation..."
                required={formData.item_type !== "note"}
              />
            </div>

            <div className="vocabulary-form-group full-width">
              <label>Example (Optional)</label>
              <textarea
                name="example"
                value={formData.example}
                onChange={handleChange}
                placeholder="Write an example..."
                rows="3"
              />
            </div>

          </div>

          <button
            type="submit"
            className="save-vocabulary-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save to My Vocabulary"}
          </button>

        </form>
      )}

      {saveMessage && (
        <p className="vocabulary-save-message">
          {saveMessage}
        </p>
      )}

      {/* List Header */}
      <div className="vocabulary-list-header">
        <h2>My Collection</h2>
        <span>{filteredWords.length} items found</span>
      </div>

      {/* Items */}
      {loading ? (
        <div className="vocabulary-empty">
          <h3>Loading your vocabulary...</h3>
        </div>
      ) : error ? (
        <div className="vocabulary-empty">
          <h3>{error}</h3>
          <button onClick={fetchWords}>Try Again</button>
        </div>
      ) : filteredWords.length > 0 ? (

        <div className="vocabulary-grid">

          {filteredWords.map((item) => (
            <div className="vocabulary-card" key={item.id}>

              <div className="vocabulary-card-top">

                <span
                  className={`vocabulary-level ${(item.level || "Beginner").toLowerCase()}`}
                >
                  {item.level || "Beginner"}
                </span>

                <button
                  className="delete-word-btn"
                  onClick={() => deleteWord(item.id)}
                  title="Delete item"
                >
                  ✕
                </button>

              </div>

              <span className="vocabulary-item-type">
                {getItemLabel(item.item_type)}
              </span>

              <h3>{item.word}</h3>

              {item.item_type === "word" && (
                <span className="vocabulary-word-type">
                  {item.type}
                </span>
              )}

              <div className="vocabulary-meaning">
                <span>Meaning</span>
                <strong>{item.meaning}</strong>
              </div>

              {item.example && (
                <div className="vocabulary-example">
                  <span>Example</span>
                  <p>"{item.example}"</p>
                </div>
              )}

              <div className="vocabulary-card-footer">
                <span>📅 {formatDate(item.created_at)}</span>
                <span>Saved {getItemLabel(item.item_type)}</span>
              </div>

            </div>
          ))}

        </div>

      ) : (
        <div className="vocabulary-empty">
          <span>🔎</span>
          <h3>No items found</h3>
          <p>
            {words.length === 0
              ? "Your collection is empty. Start adding new items!"
              : "Try another search or select a different level."}
          </p>
        </div>
      )}

    </div>
  );
}

export default Vocabulary;


