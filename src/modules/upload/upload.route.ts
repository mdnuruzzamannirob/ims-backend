import { Router } from "express";
import { uploadController } from "./upload.controller";
import { upload } from "../../core/upload";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post("/single", upload.single("file"), uploadController.uploadSingle);
router.post(
  "/multiple",
  upload.array("files", 10),
  uploadController.uploadMultiple,
);
router.get("/:id", uploadController.getById);
router.get("/relation/:model/:modelId", uploadController.getByRelation);
router.delete("/:id", uploadController.remove);

export const uploadRoutes = router;
