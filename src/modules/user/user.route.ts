import { Router } from "express";
import { userController } from "./user.controller";
import validate from "../../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  updateUserSchema,
} from "./user.validation";
import auth, { requirePermission } from "../../middlewares/auth";
import { uploadAvatar } from "../../core/upload";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  userController.refreshToken,
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  userController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  userController.resetPassword,
);
router.get(
  "/verify-email/:token",
  validate(verifyEmailSchema),
  userController.verifyEmail,
);

// Protected routes
router.get("/profile", auth(), userController.getProfile);
router.patch(
  "/profile",
  auth(),
  uploadAvatar.single("avatar"),
  validate(updateProfileSchema),
  userController.updateProfile,
);
router.post(
  "/change-password",
  auth(),
  validate(changePasswordSchema),
  userController.changePassword,
);
router.post("/logout", auth(), userController.logout);

// Admin routes
router.get(
  "/users",
  auth(),
  requirePermission("user", "read"),
  userController.getAllUsers,
);
router.get(
  "/users/:id",
  auth(),
  requirePermission("user", "read"),
  userController.getUserById,
);
router.patch(
  "/users/:id",
  auth(),
  requirePermission("user", "update"),
  validate(updateUserSchema),
  userController.updateUser,
);
router.delete(
  "/users/:id",
  auth(),
  requirePermission("user", "delete"),
  userController.deleteUser,
);

export const userRoutes = router;
