import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { userService } from "./user.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.login(req.body);
  sendResponse(res, { message: "Login successful", data: result });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.userId);
  sendResponse(res, { message: "Profile fetched", data: user });
});

export const userController = { register, login, getProfile };
