import { FileCache } from "./cache.js";
import { AniListService } from "./anime_api_fetch.js";

async function main() {
  const cache = new FileCache();
  const aniList = new AniListService(cache);

  cache.clear();

  await aniList.getAnime("Bocchi the rock!");
  await aniList.getAnime("Bocchi the rock!");

  await aniList.getSimilar("rezero");
  await aniList.getSimilar("rezero");

  await aniList.getGenre("Harem");
  await aniList.getGenre("Harem");

  aniList.rateLimit();
}

main();
