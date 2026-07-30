import "dotenv/config";

const ANILIST_URL = "https://graphql.anilist.co";
const TOKEN = process.env.ANILIST_TOKEN;

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

async function test_fetch(name) {
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

    if (!response.ok) {
      console.error("API Error Response:", result);
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

test_fetch("Chainsmoker Cat");
