import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    statusCode: 429,
    message: { message: "Muitas tentativas. Tente novamente mais tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    statusCode: 429,
    message: { message: "Muitas requisições. Tente novamente mais tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});