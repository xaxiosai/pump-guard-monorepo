import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "~/config/env";
import routes from "~/routes";

const app = express();

const perSecondLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  message: { success: false, message: "Too many requests, max 10 per second", data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

const per15SecondsLimiter = rateLimit({
  windowMs: 15000,
  max: 25,
  message: { success: false, message: "Too many requests, max 25 per 15 seconds", data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

const perMinuteLimiter = rateLimit({
  windowMs: 60000,
  max: 50,
  message: { success: false, message: "Too many requests, max 50 per minute", data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", perSecondLimiter);
app.use("/api", per15SecondsLimiter);
app.use("/api", perMinuteLimiter);

app.use("/api", routes);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
