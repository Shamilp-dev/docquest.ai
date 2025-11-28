// lib/rateLimit.ts
/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, consider Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests in the time window
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const key = identifier;

  // Initialize or reset if window expired
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.interval,
    };
    return true;
  }

  // Increment count
  store[key].count++;

  // Check if limit exceeded
  return store[key].count <= config.maxRequests;
}

export function getRateLimitStatus(identifier: string): {
  remaining: number;
  resetTime: number;
} | null {
  const key = identifier;
  const entry = store[key];

  if (!entry) {
    return null;
  }

  return {
    remaining: Math.max(0, entry.count),
    resetTime: entry.resetTime,
  };
}

// Predefined rate limit configurations
export const RateLimits = {
  // Strict limit for authentication endpoints (prevent brute force)
  AUTH: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // Moderate limit for file uploads
  UPLOAD: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
  },
  
  // Generous limit for search/query
  SEARCH: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  },
  
  // General API limit
  API: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
};
