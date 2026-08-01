import { get_anime, similar_anime, getRateLimit } from "./simple_api_fetch.js";

// This is the test script for website to come
await get_anime("Bocchi the rock!");
await get_anime("Rent a girlfriend season 2");
await similar_anime("saga of Tanya the evil");
await similar_anime("rezero");
await get_anime("nino nakano season 69");
getRateLimit(); // even failed request will be counted
