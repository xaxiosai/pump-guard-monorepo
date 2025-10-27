import { Router } from "express";
import scannerRoutes from "./scanner.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/scanner", scannerRoutes);
router.use("/health", healthRoutes);

export default router;
