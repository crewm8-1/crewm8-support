import { Router, Request, Response } from "express";
import pkg from "../../package.json";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", version: pkg.version });
});

export default router;
