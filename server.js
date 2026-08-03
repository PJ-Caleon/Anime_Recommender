import express from "express";
import cors from "cors";
import { AniListService } from "./anime_api_fetch.js";
import { FileCache } from "./cache.js";

const app = express();
const PORT = process.env.PORT || 3000;

const cacheInstance = new FileCache("./cache.json");

// Remove cache every time server restarts
cacheInstance.clear();

const anilist = new AniListService(cacheInstance);

app.use(cors());
app.use(express.json());

app.get("/api/anime", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "name is required" });
  const data = await anilist.getAnime(name);
  if (!data) return res.status(404).json({ error: "Anime not found" });
  res.json({
    data,
    rateRemain: anilist.rateRemain ?? "30",
  });
});

app.listen(PORT, () => {});
