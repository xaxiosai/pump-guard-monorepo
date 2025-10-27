import { Router } from "express";
import moment from "moment-timezone";
import { sendSuccess } from "~/utils/response";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, "Service is healthy", {
    timestamp: moment.utc().unix(),
  });
});

export default router;