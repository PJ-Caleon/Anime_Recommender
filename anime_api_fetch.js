import "dotenv/config";
import { getCache, setCache } from "./cache.js";

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

// GraphQL HTTP request
async function fetchGraphQL(query, variables) {
  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    },
    body: JSON.stringify({ query, variables }),
  };

  const response = await fetch(ANILIST_URL, option);
  rateRemain = response.headers.get("x-ratelimit-remaining");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }
  return result.data;
}

export async function get_anime(name) {
  const cacheKey = `anime:${name.toLowerCase()}`;
  let anime = getCache(cacheKey);

  if (anime) {
    console.log(`[Cache HIT] Returning cached data for ${name}`);
  } else {
    console.log(`[Cache MISS] Fetching ${name} from API...\n`);

    try {
      const data = await fetchGraphQL(query, { search: name });
      const raw = data.Media;

      const cleanDescription = raw.description
        ? raw.description
            .replace(/<[^>]*>?/gm, "")
            .replace(/\n*\(Source:.*?\)/gi, "")
            .trim()
        : "No description available";

      anime = {
        title: raw.title.english || raw.title.romaji,
        genres: raw.genres,
        averageScore: raw.averageScore ? `${raw.averageScore}%` : "N/A",
        status: raw.status,
        episodes: raw.episodes ?? "N/A",
        description: cleanDescription,
      };

      setCache(cacheKey, anime);
    } catch (error) {
      console.error("Fetch failed:", error);
      return null;
    }
  }

  console.log("Anime Data");
  console.log(`Title           : ${anime.title}`);
  console.log(`Genre           : ${anime.genres.join(", ")}`);
  console.log(`Average Score   : ${anime.averageScore}`);
  console.log(`Status          : ${anime.status}`);
  console.log(`Episodes        : ${anime.episodes}`);
  console.log(`Description     : ${anime.description}\n`);
  return anime;
}

export async function similar_anime(anime) {
  const cacheKey = `similar:${anime.toLowerCase()}`;
  let recommendations = getCache(cacheKey);

  if (recommendations) {
    console.log(`[Cache HIT] Returning cached similar for ${anime}`);
  } else {
    console.log(`[Cache MISS] Fetching similar to ${anime}`);

    try {
      const data = await fetchGraphQL(similarQuery, { search: anime });
      const recNodes = data.Media?.recommendations?.nodes || [];

      recommendations = recNodes
        .filter((nodes) => nodes.mediaRecommendation !== null)
        .map((nodes) => {
          const rec = nodes.mediaRecommendation;
          return {
            title: rec.title.english || rec.title.romaji,
            score: rec.averageScore ? `${rec.averageScore}%` : "N/A",
            genres: rec.genres,
          };
        });

      setCache(cacheKey, recommendations);
    } catch (error) {
      console.error("Fetch failed:", error);
      return [];
    }
  }
  console.log(`Similar anime to "${anime}":`);
  recommendations.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.title} (${item.score}) - Genres: ${item.genres.join(", ")}`,
    );
  });
  console.log("\n");
  return recommendations;
}

export async function genre(genre_name) {
  const cacheKey = `genre:${genre_name.toLowerCase()}`;
  let genreList = getCache(cacheKey);

  if (genreList) {
    console.log(`[Cache HIT] Returning cached list for genre "${genre_name}"`);
  } else {
    console.log(`[Cache MISS] Fetching top anime for genre "${genre_name}"`);
    try {
      const data = await fetchGraphQL(genreQuery, { genre: genre_name });
      const rawList = data?.Page?.media || [];

      genreList = rawList.map((item) => ({
        title: item.title.english || item.title.romaji,
        score: item.averageScore ? `(${item.averageScore}%)` : "N/A",
        genres: item.genres,
      }));

      setCache(cacheKey, genreList);
    } catch (error) {
      console.error("Fetch failed:", error);
      return [];
    }
  }
  console.log(`Top 10 ${genre_name} anime:`);
  genreList.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title} ${item.score}`);
  });
  console.log("\n");
  return genreList;
}

export function getRateLimit() {
  console.log(`[Quota: ${rateRemain} request left]`);
}
