
import { env } from "../config/env.js";

let cachedDoctors = null;
let expiresAt = 0;
let refreshPromise = null;

export function invalidateCache() {
  expiresAt = 0;
}

export async function getCachedDoctors(loader) {
  if (cachedDoctors && Date.now() < expiresAt) {
    return cachedDoctors;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = loader()
    .then(data => {
      cachedDoctors = data;
      expiresAt = Date.now() + Math.max(1000, env.CACHE_TTL_MS);
      return data;
    })
    .catch(error => {
      if (cachedDoctors) {
        console.error("Serving stale cache:", error.message);
        return cachedDoctors;
      }
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
