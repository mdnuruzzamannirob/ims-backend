import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { userService } from "./user.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "User registered successfully. Please verify your email.",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.login(req.body);
  sendResponse(res, { message: "Login successful", data: result });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.refreshAccessToken(req.body.refreshToken);
  sendResponse(res, { message: "Token refreshed", data: result });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  await userService.logout(req.user!.userId);
  sendResponse(res, { message: "Logged out successfully" });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await userService.verifyEmail(req.params.token as string);
  sendResponse(res, { message: "Email verified successfully" });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await userService.forgotPassword(req.body.email);
  sendResponse(res, {
    message: "If the email exists, a reset link has been sent",
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await userService.resetPassword(
    req.params.token as string,
    req.body.password,
  );
  sendResponse(res, { message: "Password reset successful" });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await userService.changePassword(
    req.user!.userId,
    req.body.currentPassword,
    req.body.newPassword,
  );
  sendResponse(res, { message: "Password changed successfully" });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.userId);
  sendResponse(res, { message: "Profile fetched", data: user });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.userId, req.body);
  sendResponse(res, { message: "Profile updated", data: user });
});

// Admin-only
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { users, meta } = await userService.getAllUsers(req.query as any);
  sendResponse(res, { message: "Users fetched", data: users, meta });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  sendResponse(res, { message: "User fetched", data: user });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body);
  sendResponse(res, { message: "User updated", data: user });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string);
  sendResponse(res, { message: "User deleted" });
});

export const userController = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
