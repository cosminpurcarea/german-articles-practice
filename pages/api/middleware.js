// import { rateLimit } from 'next-api-rate-limit';

// export const rateLimitMiddleware = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500, // Max 500 users per minute
// }); 

// Simple rate limiting middleware
export const rateLimitMiddleware = (req, res, next) => {
  // Get IP from standard or proxy headers
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Rate limiting state (would use Redis in production)
  if (!global.rateLimit) {
    global.rateLimit = {
      ipMap: new Map(),
      resetTimeout: null
    };
  }
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 60; // 60 requests per minute
  
  // Initialize or get existing rate limit data for IP
  let rateLimitData = global.rateLimit.ipMap.get(ip) || {
    count: 0,
    resetTime: now + windowMs
  };
  
  // Reset counters if window has elapsed
  if (now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs
    };
  }
  
  // Increment counter
  rateLimitData.count++;
  global.rateLimit.ipMap.set(ip, rateLimitData);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitData.count));
  res.setHeader('X-RateLimit-Reset', rateLimitData.resetTime);
  
  // Check if rate limit exceeded
  if (rateLimitData.count > maxRequests) {
    return res.status(429).json({
      error: 'Too many requests, please try again later.'
    });
  }
  
  // If we reach here, proceed with the request
  next();
}; 