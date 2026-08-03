import fs from "node:fs";
import path from "node:path";

export class FileCache {
  constructor(filePath = "./cache.json") {
    this.cacheFile = path.resolve(filePath);
  }
  #loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, "utf-8");
        if (!data.trim()) {
          return {};
        }
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading cache file:", error);
    }
    return {};
  }

  #saveCache(cacheData) {
    try {
      fs.writeFileSync(
        this.cacheFile,
        JSON.stringify(cacheData, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Error writing cache file:", error);
    }
  }

  get(key) {
    const cacheStore = this.#loadCache();
    const item = cacheStore[key];

    if (!item) {
      return null;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      delete cacheStore[key];
      this.clear(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlInSeconds = null) {
    const cacheStore = this.#loadCache();

    cacheStore[key] = {
      value: value,
      expiresAt: ttlInSeconds ? Date.now() + ttlInSeconds * 1000 : null,
    };
    this.#saveCache(cacheStore);
  }

  clear(key = null) {
    try {
      if (!key) {
        fs.writeFileSync(this.cacheFile, JSON.stringify({}, null, 2), "utf-8");
        console.log("[Cache CLEAR] Cleared cache entries");
        return;
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
}
