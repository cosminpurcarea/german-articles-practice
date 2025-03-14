// import { rateLimit } from 'next-api-rate-limit';

// export const rateLimitMiddleware = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500, // Max 500 users per minute
// }); 

// Temporary placeholder to get the build working
export const rateLimitMiddleware = (req, res, next) => {
  next();
}; 