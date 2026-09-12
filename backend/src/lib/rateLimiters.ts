import { RateLimiterMemory } from 'rate-limiter-flexible';

export const generalLimiter = new RateLimiterMemory({ points: 240, duration: 60 });
export const authLimiter = new RateLimiterMemory({ points: 10, duration: 60 });
export const adminAuthLimiter = new RateLimiterMemory({ points: 5, duration: 60 });
export const writeLimiter = new RateLimiterMemory({ points: 30, duration: 60 });
export const upiWebhookLimiter = new RateLimiterMemory({ points: 60, duration: 60 });
