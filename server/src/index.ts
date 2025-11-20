import express from "express";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "~/config/env";
import routes from "~/routes";
import { socketService } from "~/services/socket.service";

const app = express();
app.set("trust proxy", true);
const httpServer = createServer(app);

const perSecondLimiter = rateLimit({
  windowMs: 1000,
  max: 20,
  message: { success: false, message: "Too many requests, max 20 per second", data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  validate: { trustProxy: false },
});

const per15SecondsLimiter = rateLimit({
  windowMs: 15000,
  max: 50,
  message: { success: false, message: "Too many requests, max 50 per 15 seconds", data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  validate: { trustProxy: false },
});

const perMinuteLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
  message: { success: false, message: "Too many requests, max 100 per minute", data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  validate: { trustProxy: false },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", perSecondLimiter);
app.use("/api", per15SecondsLimiter);
app.use("/api", perMinuteLimiter);

app.use("/api", routes);

socketService.initialize(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
