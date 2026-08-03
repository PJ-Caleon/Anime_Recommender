import "dotenv/config";

const QUERIES = {
  anime: `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        title { english romaji }
        genres averageScore status episodes description
      }
    }`,
  similar: `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        title { english romaji }
        recommendations(perPage: 12, sort: RATING_DESC){
          nodes { mediaRecommendation { title { english } averageScore genres } }
        }
      }
    }`,
  genre: `
    query ($genre: String) {
      Page(page: 1, perPage: 12){
        media(genre: $genre, type: ANIME, sort: SCORE_DESC) {
          title { english romaji }
          averageScore genres
        }
      }
    }`,
};

export class AniListService {
  #apiUrl = "https://graphql.anilist.co";
  #token = process.env.ANILIST_TOKEN;

  constructor(cacheInstance = null) {
    this.cache = cacheInstance;
    this.rateRemain = null;
  }

  async #fetchGraphQL(query, variables) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(this.#token && { Authorization: `Bearer ${this.#token}` }),
      },
      body: JSON.stringify({ query, variables }),
    };

    const response = await fetch(this.#apiUrl, options);
    this.rateRemain = response.headers.get("x-ratelimit-remaining");
    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(JSON.stringify(result));
    }
    if (result.data?.Page?.media?.length === 0 || result.data?.Media === null) {
      throw new Error("No matching records found for this query");
    }
    return result.data;
  }

  async getAnime(name) {
    const cacheKey = `anime:${name.toLowerCase()}`;
    let anime = this.cache?.get(cacheKey);

    if (anime) {
      console.log(`[Cache HIT] Returning cached data for ${name}`);
    } else {
      console.log(`[Cache MISS] Fetching ${name} from API...\n`);
      try {
        const data = await this.#fetchGraphQL(QUERIES.anime, { search: name });
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

        if (this.cache) this.cache.set(cacheKey, anime);
      } catch (error) {
        console.error("Fetch failed:", error);
        return null;
      }
    }
    return anime;
  }

  async getSimilar(animeName) {
    const cacheKey = `similar:${animeName.toLowerCase()}`;
    let recommendations = this.cache?.get(cacheKey);

    if (recommendations) {
      console.log(`[Cache HIT] Returning cached similar for ${animeName}`);
    } else {
      console.log(`[Cache MISS] Fetching similar to ${animeName}`);
      try {
        const data = await this.#fetchGraphQL(QUERIES.similar, {
          search: animeName,
        });
        const recNodes = data.Media?.recommendations?.nodes || [];

        recommendations = recNodes
          .filter((node) => node.mediaRecommendation !== null)
          .map((node) => {
            const rec = node.mediaRecommendation;
            return {
              title: rec.title.english || rec.title.romaji,
              score: rec.averageScore ? `${rec.averageScore}%` : "N/A",
              genres: rec.genres,
            };
          });

        if (this.cache) this.cache.set(cacheKey, recommendations);
      } catch (error) {
        console.error("Fetch failed:", error);
        return [];
      }
    }
    return recommendations;
  }

  async getGenre(genreName) {
    const cacheKey = `genre:${genreName.toLowerCase()}`;
    let genreList = this.cache?.get(cacheKey);

    if (genreList) {
      console.log(`[Cache HIT] Returning cached list for genre "${genreName}"`);
    } else {
      console.log(`[Cache MISS] Fetching top anime for genre "${genreName}"`);
      try {
        const data = await this.#fetchGraphQL(QUERIES.genre, {
          genre: genreName,
        });
        const rawList = data?.Page?.media || [];

        genreList = rawList.map((item) => ({
          title: item.title.english || item.title.romaji,
          score: item.averageScore ? `(${item.averageScore}%)` : "N/A",
          genres: item.genres,
        }));

        if (this.cache) this.cache.set(cacheKey, genreList);
      } catch (error) {
        console.error("Fetch failed:", error);
        return [];
      }
    }
    return genreList;
  }

  rateLimit() {
    console.log(`[Quota: ${this.rateRemain ?? "Unknown"} request(s) left]`);
  }
}
