import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AniListService } from "./anime_api_fetch.js";

describe("AniListService", () => {
  let service;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new AniListService();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // Mock Tests - test if program logic works
  describe("Unit Tests (Mocked API)", () => {
    // Testing: getAnime function
    it("getAnime: should parse raw API structure cleanly", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([["x-ratelimit-remaining", "80"]]),
        json: async () => ({
          data: {
            Media: {
              title: {
                english: "Bocchi the Rock!",
                romaji: "Bocchi the Rock!",
              },
              genres: ["Comedy", "Music"],
              averageScore: 88,
              status: "FINISHED",
              episodes: 12,
              description: "A relatable anime.",
            },
          },
        }),
      });

      const anime = await service.getAnime("Bocchi the Rock!");

      expect(anime).not.toBeNull();
      expect(anime.title).toBe("Bocchi the Rock!");
      expect(anime.averageScore).toBe("88%");
    });
    // Testing: getSimilar function
    it("getSimilarAnime: should format recommendation nodes", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([["x-ratelimit-remaining", "79"]]),
        json: async () => ({
          data: {
            Media: {
              recommendations: {
                nodes: [
                  {
                    mediaRecommendation: {
                      title: { english: "K-On!" },
                      averageScore: 85,
                      genres: ["Music", "Slice of Life"],
                    },
                  },
                ],
              },
            },
          },
        }),
      });

      const similar = await service.getSimilar("Bocchi the Rock!");

      expect(similar).toHaveLength(1);
      expect(similar[0].title).toBe("K-On!");
    });
    // Test getGenre function
    it("getGenre: should format top list items", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([["x-ratelimit-remaining", "78"]]),
        json: async () => ({
          data: {
            Page: {
              media: [
                {
                  title: { english: "One Punch Man" },
                  averageScore: 90,
                  genres: ["Comedy", "Action"],
                },
              ],
            },
          },
        }),
      });

      const genreList = await service.getGenre("Comedy");

      expect(genreList).toHaveLength(1);
      expect(genreList[0].title).toBe("One Punch Man");
    });
  });

  // Real Network test - test the API network
  describe("Integration Tests (Live Network)", () => {
    // Test getAnime function
    it("getAnime: should fetch real anime details from AniList", async () => {
      const anime = await service.getAnime("Chainsmoker Cat");

      expect(anime).not.toBeNull();
      expect(anime.title).toContain("Chainsmoker Cat");
      expect(Array.isArray(anime.genres)).toBe(true);
    }, 10000); // 10 second timeout for network requests
    // Test getSimilar function
    it("getSimilarAnime: should fetch real recommendations from AniList", async () => {
      const similar = await service.getSimilar("Konosuba");

      expect(Array.isArray(similar)).toBe(true);
      expect(similar.length).toBeGreaterThan(0);
    }, 10000);
    // Test getGenre function
    it("getByGenre: should fetch top anime for a genre from AniList", async () => {
      const genreList = await service.getGenre("Action");

      expect(Array.isArray(genreList)).toBe(true);
      expect(genreList.length).toBeGreaterThan(0);
    }, 10000);
  });
});
