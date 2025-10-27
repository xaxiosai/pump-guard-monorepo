import { Router } from "express";
import { scanToken } from "~/controllers/scanner.controller";
import { validateParams } from "~/middleware/validate";
import { scanTokenParamsSchema } from "~/utils/validators";

const router = Router();

router.get("/scan/:tokenAddress", validateParams(scanTokenParamsSchema), scanToken);

export default router;
