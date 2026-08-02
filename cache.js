import fs from "node:fs";
import path from "node:path";

const CACHE_FILE = path.resolve("./cache.json");

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
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

function saveCache(cacheData) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing cache file:", error);
  }
}

export function getCache(key) {
  const cacheStore = loadCache();
  const item = cacheStore[key];

  if (!item) {
    return null;
  }

  if (item.expiresAt && Date.now() > item.expiresAt) {
    delete cacheStore[key];
    saveCache(cacheStore);
    return null;
  }
  return item.value;
}

export function setCache(key, value, ttlInSeconds = null) {
  const cacheStore = loadCache();

  cacheStore[key] = {
    value: value,
    expiresAt: ttlInSeconds ? Date.now() + ttlInSeconds * 1000 : null,
  };
  saveCache(cacheStore);
}

export function clearCache(key = null) {
  try {
    if (!key) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2), "utf-8");
      console.log("[Cache CLEAR] Cleared cache entries");
      return;
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}
