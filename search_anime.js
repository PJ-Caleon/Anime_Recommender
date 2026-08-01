import {
  get_anime,
  similar_anime,
  genre,
  getRateLimit,
} from "./simple_api_fetch.js";

// This is the test script for website to come
await get_anime("Bocchi the rock!");
await similar_anime("saga of Tanya the evil");
await genre("Slice of life");
await get_anime("nino nakano season 69");
getRateLimit(); // even failed request will be counted
