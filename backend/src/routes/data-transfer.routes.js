import { Router } from "express";
import multer from "multer";
import DataTransferController from "../controllers/data-transfer.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/export/:entity", DataTransferController.exportEntity);
router.post("/import-preview/:entity", upload.single("file"), DataTransferController.previewImport);
router.post("/import/:entity", upload.single("file"), DataTransferController.importEntity);

export default router;
