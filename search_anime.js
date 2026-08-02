import {
  get_anime,
  similar_anime,
  genre,
  getRateLimit,
} from "./anime_api_fetch.js";

import { clearCache } from "./cache.js";

// This is the test script for website to come
clearCache();
await get_anime("Bocchi the rock!");
await get_anime("Bocchi the rock!");
await similar_anime("saga of Tanya the evil");
await similar_anime("saga of Tanya the evil");
await genre("Slice of life");
await genre("Slice of life");
//await get_anime("nino nakano season 69");
getRateLimit(); // even failed request will be counted
