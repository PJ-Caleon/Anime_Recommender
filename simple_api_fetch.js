import "dotenv/config";

const ANILIST_URL = "https://graphql.anilist.co";
const TOKEN = process.env.ANILIST_TOKEN;

export let rateRemain = null;

const query = `
  query ($search: String) {
    Media (search: $search, type: ANIME) {
      title {
        english
        romaji
      }
      genres
      averageScore
      status
      episodes
      description
    }
  }
`;

const similarQuery = `
  query ($search: String) {
    Media (search: $search, type: ANIME) {
      title { english romaji}
      recommendations(perPage: 10, sort: RATING_DESC){
        nodes {
          mediaRecommendation {
            title { english }
            averageScore
            genres
        }
      }
    }
  }
}
`;

const genreQuery = `
  query ($genre: String) {
    Page(page: 1, perPage: 10){
      media(genre: $genre, type: ANIME, sort: SCORE_DESC) {
        title {english romaji}
        averageScore
        genres
      }
    }
  }
`;

export async function get_anime(name) {
  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    },
    body: JSON.stringify({
      query: query,
      variables: { search: name },
    }),
  };

  try {
    const response = await fetch(ANILIST_URL, option);
    const result = await response.json();

    // Check rate limit
    rateRemain = response.headers.get("x-ratelimit-remaining");

    if (!response.ok) {
      console.error("API Error Response:", result);
      console.error(`${name} not in database\n`);
      return;
    }

    const anime = result.data.Media;

    const cleanDescription = anime.description
      ? anime.description
          .replace(/<[^>]*>?/gm, "")
          .replace(/\n*\(Source:.*?\)/gi, "")
          .trim()
      : "No description available";

    console.log("Anime Data");
    console.log(`Title : ${anime.title.english}`);
    console.log(`Genre           : ${anime.genres.join(", ")}`);
    console.log(
      `Average Score   : ${anime.averageScore ? anime.averageScore + "%" : "N/A"}`,
    );
    console.log(`Status          : ${anime.status}`);
    console.log(`Episodes        : ${anime.episodes ?? "N/A"}`);
    console.log(`Description     : ${cleanDescription}\n`);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

export async function similar_anime(anime) {
  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    },
    body: JSON.stringify({
      query: similarQuery,
      variables: { search: anime },
    }),
  };

  try {
    const response = await fetch(ANILIST_URL, option);
    const result = await response.json();

    // Check rate limit
    rateRemain = response.headers.get("x-ratelimit-remaining");

    if (!response.ok) {
      console.error("API Error Response:", result);
      console.error(`${anime} not in database\n`);
      return [];
    }

    const media = result.data.Media;
    const recNodes = media?.recommendations?.nodes || [];

    const recommendations = recNodes
      .filter((nodes) => nodes.mediaRecommendation !== null)
      .map((nodes) => {
        const rec = nodes.mediaRecommendation;
        return {
          title: rec.title.english || rec.title.romaji,
          score: rec.averageScore ? `${rec.averageScore}%` : "N/A",
          genres: rec.genres,
        };
      });

    console.log(`Similar anime to "${media.title.english}":`);
    recommendations.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.title} (${item.score}) - Genres: ${item.genres.join(", ")}`,
      );
    });
    console.log("\n");

    return recommendations;
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

export async function genre(genre_name) {
  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    },
    body: JSON.stringify({
      query: genreQuery,
      variables: { genre: genre },
    }),
  };

  try {
    const response = await fetch(ANILIST_URL, option);
    const result = await response.json();

    rateRemain = response.headers.get("x-ratelimit-remaining");

    if (!response.ok) {
      console.error("API Error:", result);
      console.error(`${genre_name} is not a valid genre`);
      return [];
    }

    const genreList = result.data?.Page?.media || [];

    console.log(`Top 10 ${genre_name}: `);
    genreList.forEach((anime, index) => {
      console.log(`${index + 1}. ${anime.title.english || anime.title.romaji}`);
    });
    return genreList;
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

export function getRateLimit() {
  console.log(`[Quota: ${rateRemain} request left/ min]`);
}

// console.log(get_anime("Chainsmoker Cat"));
// await similar_anime("Chainsmoker Cat");
await genre("Action");
