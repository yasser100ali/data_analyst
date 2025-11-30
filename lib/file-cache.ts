/**
 * File Upload Cache Utilities
 * 
 * Manages cached file upload URLs to prevent re-uploading the same files to Vercel Blob
 * and avoid "duplicate file" errors from the blob storage service.
 */

export interface CachedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  timestamp: number;
}

const CACHE_KEY = "atlas_file_upload_cache";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get all cached file uploads from localStorage
 */
export const getFileCache = (): Record<string, CachedFile> => {
  if (typeof window === "undefined") return {};
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

/**
 * Save file cache to localStorage
 */
export const setFileCache = (cache: Record<string, CachedFile>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn("Failed to save file cache:", err);
  }
};

/**
 * Generate a unique cache key for a file based on name, size, and type
 */
export const getCacheKey = (file: File): string => {
  return `${file.name}_${file.size}_${file.type}`;
};

/**
 * Get cached file URL if it exists and hasn't expired
 */
export const getCachedFileUrl = (file: File): CachedFile | null => {
  const cache = getFileCache();
  const key = getCacheKey(file);
  const cached = cache[key];
  
  if (!cached) return null;
  
  // Check if cache is expired
  const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY_MS;
  if (isExpired) {
    // Remove expired entry
    delete cache[key];
    setFileCache(cache);
    return null;
  }
  
  return cached;
};

/**
 * Cache a file upload URL
 */
export const cacheFileUrl = (file: File, url: string) => {
  const cache = getFileCache();
  const key = getCacheKey(file);
  
  cache[key] = {
    name: file.name,
    size: file.size,
    type: file.type,
    url,
    timestamp: Date.now(),
  };
  
  setFileCache(cache);
};

/**
 * Remove expired cache entries
 */
export const cleanExpiredCache = () => {
  if (typeof window === "undefined") return;
  const cache = getFileCache();
  const now = Date.now();
  let hasChanges = false;
  
  Object.keys(cache).forEach((key) => {
    if (now - cache[key].timestamp > CACHE_EXPIRY_MS) {
      delete cache[key];
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    setFileCache(cache);
  }
};

/**
 * Clear all cached file uploads (useful for debugging)
 */
export const clearFileCache = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
  console.log("✓ File upload cache cleared");
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const cache = getFileCache();
  const entries = Object.values(cache);
  const totalSize = entries.reduce((sum, file) => sum + file.size, 0);
  const expired = entries.filter(
    (file) => Date.now() - file.timestamp > CACHE_EXPIRY_MS
  ).length;
  
  return {
    totalFiles: entries.length,
    totalSize: totalSize,
    expiredFiles: expired,
    files: entries.map((f) => ({
      name: f.name,
      size: f.size,
      age: Date.now() - f.timestamp,
      url: f.url,
    })),
  };
};

// Expose utilities to window for debugging (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).atlasFileCache = {
    get: getFileCache,
    clear: clearFileCache,
    stats: getCacheStats,
  };
  console.log("📦 Atlas file cache utilities available: window.atlasFileCache");
}

