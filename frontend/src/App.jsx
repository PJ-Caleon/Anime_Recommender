import { useState } from "react";
import InputBox from "./components/InputBox";
import RadioBox from "./components/RadioBox";
import "./index.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ani-search-0eod.onrender.com";

export default function App() {
  // "getAnime" | "getSimilar" | "getGenre"
  const [currentFunction, setCurrentFunction] = useState("getAnime");

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const radioOptions = [
    { label: "Anime Details", value: "getAnime" },
    { label: "Similar Anime", value: "getSimilar" },
    { label: "Anime Genre", value: "getGenre" },
  ];

  const routeMap = {
    getAnime: "/api/anime",
    getSimilar: "/api/similar",
    getGenre: "/api/genre",
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    const endpoint = routeMap[currentFunction] || "/api/anime";

    try {
      const response = await fetch(
        `${API_BASE_URL}${endpoint}?name=${encodeURIComponent(searchTerm)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${currentFunction}`);
      }

      const resJson = await response.json();
      setResults(resJson.data);
      setQuota(resJson.rateRemain);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>Ani.Search</h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--muted)",
            marginBottom: "1rem",
          }}
        >
          A web dev project
        </p>

        <p
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "6px",
            marginBottom: "0.75rem",
            fontSize: "0.9rem",
          }}
        >
          Uses:
          <code>React</code>
          <code>Express</code>
          <code>JavaScript</code>
          <code>GitHub CI/CD</code>
          <code>AniList API</code>
        </p>

        <p style={{ fontSize: "0.9rem", color: "var(--subtle)" }}>
          Made by{" "}
          <a
            href="https://pj-profile.netlify.app/"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--iris)",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Kagz
          </a>
        </p>
      </header>
      <main className="app-content">
        <RadioBox
          options={radioOptions}
          selected={currentFunction}
          onChange={(val) => {
            setCurrentFunction(val);
            setResults(null);
            setError(null);
          }}
        />
        <InputBox
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSubmit={handleSearch}
        />

        <div className="results-container">
          {loading && <p>Fetching results...</p>}
          {error && <p className="error-message">Error: {error}</p>}

          {!loading && results && (
            <>
              {/* Layout for getAnime */}
              {currentFunction === "getAnime" && (
                <div className="anime-card">
                  <h2>{results.title}</h2>
                  <p>
                    <strong>Score:</strong> {results.averageScore}
                  </p>
                  <p>
                    <strong>Status:</strong> {results.status}
                  </p>
                  <p>
                    <strong>Episodes:</strong> {results.episodes}
                  </p>
                  <p>
                    <strong>Genres:</strong> {results.genres?.join(", ")}
                  </p>
                  <p className="description">{results.description}</p>
                </div>
              )}

              {/* Layout for getSimilar / getGenre */}
              {(currentFunction === "getSimilar" ||
                currentFunction === "getGenre") && (
                <div className="anime-grid">
                  {Array.isArray(results) &&
                    results.map((item, index) => (
                      <div key={index} className="grid-card">
                        <h3>{item.title}</h3>
                        <p>
                          <strong>Score:</strong> {item.score}
                        </p>
                        <p>
                          <strong>Genres:</strong> {item.genres?.join(", ")}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {quota !== null && (
        <div className="quota-badge">
          <code>Quota: {quota} left/min</code>
        </div>
      )}
    </div>
  );
}
