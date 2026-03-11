import { Router } from "express";
import { userController } from "./user.controller";
import validate from "../../middlewares/validate";
import { registerSchema, loginSchema } from "./user.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);
router.get("/profile", auth(), userController.getProfile);

export const userRoutes = router;
