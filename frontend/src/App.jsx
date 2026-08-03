import { useState } from "react";
import InputBox from "./components/InputBox";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [animeData, setAnimeData] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/anime?name=${encodeURIComponent(searchTerm)}`,
      );

      if (!response.ok) {
        throw new Error("Anime not found");
      }

      const resJson = await response.json();
      setAnimeData(resJson.data);
      setQuota(resJson.rateRemain);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setAnimeData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Anime Recommender</h1>
        <p>
          Type an anime title to run <code>getAnime</code>
        </p>
      </header>

      <main className="app-content">
        <InputBox
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSubmit={handleSearch}
        />

        <div className="results-container" style={{ marginTop: "2rem" }}>
          {loading && <p>Fetching anime details...</p>}
          {error && <p style={{ color: "var(--love)" }}>Error: {error}</p>}

          {animeData && !loading && (
            <div className="anime-card" style={cardStyle}>
              <h2 style={{ color: "var(--rose)", marginTop: 0 }}>
                {animeData.title}
              </h2>
              <p style={itemStyle}>
                <strong>Score:</strong> {animeData.averageScore}
              </p>
              <p style={itemStyle}>
                <strong>Status:</strong> {animeData.status}
              </p>
              <p style={itemStyle}>
                <strong>Episodes:</strong> {animeData.episodes}
              </p>
              <p style={itemStyle}>
                <strong>Genres:</strong> {animeData.genres?.join(", ")}
              </p>
              <p style={{ marginTop: "1rem", lineHeight: "1.5" }}>
                {animeData.description}
              </p>
            </div>
          )}
        </div>
      </main>

      {quota !== null && (
        <div className="quota-badge">
          <code>Quota: {quota} left/ min</code>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "1.5rem",
  textAlign: "left",
  boxShadow: "var(--shadow)",
  maxWidth: "550px",
  margin: "0 auto",
};

const itemStyle = {
  marginBottom: "0.4rem",
};
