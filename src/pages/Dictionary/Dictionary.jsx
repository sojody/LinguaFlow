import { useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Dictionary.css";

function Dictionary() {
  const [search, setSearch] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedWords, setSavedWords] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Automatic English to Arabic translation
  const translateWord = async (word) => {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(word)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Translation service unavailable");
    }

    const data = await response.json();

    const translation = data[0]
      ?.map((item) => item[0])
      .filter(Boolean)
      .join("");

    if (!translation) {
      throw new Error("Translation not available");
    }

    return translation;
  };

  // Search for an English word
  const searchWord = async (e) => {
    e.preventDefault();

    const word = search.trim().toLowerCase();

    if (!word) return;

    setLoading(true);
    setError("");
    setMessage("");
    setSelectedWord(null);

    try {
      // Get English definition and pronunciation
      const dictionaryResponse = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );

      if (!dictionaryResponse.ok) {
        throw new Error("Word not found. Try another word.");
      }

      const dictionaryData = await dictionaryResponse.json();
      const entry = dictionaryData[0];

      const meanings = entry.meanings || [];

      // Prefer adjective when available
      const firstMeaning =
        meanings.find(
          (item) => item.partOfSpeech === "adjective"
        ) || meanings[0];

      const firstDefinition =
        firstMeaning?.definitions?.[0];

      if (!firstDefinition) {
        throw new Error("No definition found for this word.");
      }

      const englishMeaning =
        firstDefinition.definition || "";

      const example =
        firstDefinition.example || "";

      const phonetic =
        entry.phonetic ||
        entry.phonetics?.find((item) => item.text)?.text ||
        "Not available";

      const wordType =
        firstMeaning?.partOfSpeech || "Other";

      // Get automatic Arabic translation
      let translation = "";

      try {
        translation = await translateWord(word);
      } catch (translationError) {
        console.error("Translation Error:", translationError);
        translation = "Translation not available";
      }

      // Create word object
      const result = {
        word: entry.word,
        pronunciation: phonetic,
        type: wordType,
        definition: englishMeaning,
        translation,
        example,
        level: "Beginner",
      };

      setSelectedWord(result);

    } catch (err) {
      console.error("Dictionary Error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // Save word to Vocabulary
  const saveWord = async () => {
    if (!selectedWord || saving) return;

    if (
      !selectedWord.translation ||
      selectedWord.translation === "Translation not available"
    ) {
      setMessage("Cannot save: Arabic translation is unavailable.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;

      if (!user) {
        throw new Error("Please log in first.");
      }

      // Check if word already exists for this user
      const { data: existingWord, error: checkError } =
        await supabase
          .from("vocabulary_words")
          .select("id")
          .eq("user_id", user.id)
          .eq("word", selectedWord.word)
          .eq("item_type", "word")
          .limit(1)
          .maybeSingle();

      if (checkError) throw checkError;

      if (existingWord) {
        setSavedWords((prev) =>
          [...new Set([...prev, selectedWord.word])]
        );

        setMessage("This word is already in your vocabulary!");
        return;
      }

      // Insert word into Supabase
      const { error: insertError } = await supabase
        .from("vocabulary_words")
        .insert({
          user_id: user.id,
          word: selectedWord.word,
          meaning: selectedWord.translation,
          translation: selectedWord.translation,
          definition: selectedWord.definition,
          type: selectedWord.type,
          level: selectedWord.level,
          example: selectedWord.example,
          item_type: "word",
        });

      if (insertError) throw insertError;

      setSavedWords((prev) => [
        ...prev,
        selectedWord.word,
      ]);

      setMessage("Word saved successfully! 🎉");

    } catch (err) {
      console.error("Save Word Error:", err);

      setMessage(
        err.message || "Could not save this word. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  const isSaved = selectedWord
    ? savedWords.includes(selectedWord.word)
    : false;

  return (
    <div className="dictionary-page">

      <div className="dictionary-header">
        <h1>English Dictionary</h1>

        <p>
          Discover new words and improve your English vocabulary.
        </p>
      </div>

      <form
        className="dictionary-search-form"
        onSubmit={searchWord}
      >
        <input
          type="text"
          className="dictionary-search"
          placeholder="Search for any English word..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="submit"
          className="dictionary-search-btn"
          disabled={loading || !search.trim()}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="dictionary-content">

        <div className="dictionary-results">

          {loading && (
            <div className="dictionary-status">
              Searching for your word...
            </div>
          )}

          {error && (
            <div className="dictionary-error">
              {error}
            </div>
          )}

          {!loading && !error && !selectedWord && (
            <div className="dictionary-placeholder">
              <span>📖</span>

              <h3>Explore the English Dictionary</h3>

              <p>
                Type any English word in the search box to discover
                its meaning, pronunciation and Arabic translation.
              </p>
            </div>
          )}

          {selectedWord && (
            <div className="word-list">
              <div className="word-item selected">

                <h3>{selectedWord.word}</h3>

                <p>{selectedWord.pronunciation}</p>

                <span>{selectedWord.type}</span>

              </div>
            </div>
          )}

        </div>

        {selectedWord && (
          <div className="details">

            <div className="dictionary-word-heading">
              <h2>{selectedWord.word}</h2>

              <span>{selectedWord.pronunciation}</span>
            </div>

            <div className="dictionary-detail-section">
              <h3>Part of Speech</h3>

              <p>{selectedWord.type}</p>
            </div>

            <div className="dictionary-detail-section">
              <h3>English Definition</h3>

              <p>{selectedWord.definition}</p>
            </div>

            <div className="dictionary-detail-section">
              <h3>Arabic Translation</h3>

              <p className="arabic-translation">
                {selectedWord.translation}
              </p>
            </div>

            <div className="dictionary-detail-section">
              <h3>Example</h3>

              <p>
                {selectedWord.example ||
                  `Try using "${selectedWord.word}" in your own sentence.`}
              </p>
            </div>

            <button
              className="save-word-btn"
              onClick={saveWord}
              disabled={saving || isSaved}
            >
              {saving
                ? "Saving..."
                : isSaved
                ? "✓ Saved to Vocabulary"
                : "＋ Save to Vocabulary"}
            </button>

            {message && (
              <p className="save-word-message">
                {message}
              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Dictionary;







