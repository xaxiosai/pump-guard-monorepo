import { Router } from "express";
import rateLimit from "express-rate-limit";
import { scanToken } from "~/controllers/scanner.controller";
import { validateParams } from "~/middleware/validate";
import { scanTokenParamsSchema } from "~/utils/validators";

const router = Router();

const perSecondLimiter = rateLimit({
    windowMs: 1000,
    max: 2,
    message: { success: false, message: "Too many requests, max 2 per second", data: null },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});

const per15SecondsLimiter = rateLimit({
    windowMs: 15000,
    max: 10,
    message: { success: false, message: "Too many requests, max 10 per 15 seconds", data: null },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});

const perMinuteLimiter = rateLimit({
    windowMs: 60000,
    max: 20,
    message: { success: false, message: "Too many requests, max 20 per minute", data: null },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});

router.get("/scan/:tokenAddress", perSecondLimiter, per15SecondsLimiter, perMinuteLimiter, validateParams(scanTokenParamsSchema), scanToken);

export default router;
