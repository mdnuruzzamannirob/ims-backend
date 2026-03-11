import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User, IUser, MAX_LOGIN_ATTEMPTS, LOCK_TIME } from "./user.model";
import config from "../../config";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../core/errors";
import { emailService } from "../../core/email";
import logger from "../../core/logger";
import { auditService } from "../audit/audit.service";

// --- Token helpers ---
const generateAccessToken = (user: IUser): string => {
  return jwt.sign({ userId: user._id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
};

const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as any },
  );
};

const generateTokenPair = async (user: IUser) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// --- Auth operations ---
const register = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.create({
    ...data,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    logger.warn("Failed to send verification email", { email: user.email });
  }

  const tokens = await generateTokenPair(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    ...tokens,
  };
};

const login = async (data: { email: string; password: string }) => {
  const user = await User.findOne({ email: data.email }).select(
    "+password +refreshToken",
  );
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Account is deactivated");
  }

  // Check account lock
  if (user.isLocked()) {
    throw new UnauthorizedError(
      "Account temporarily locked due to too many failed attempts. Try again later.",
    );
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    // Increment login attempts
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME);
      logger.warn(`Account locked: ${user.email}`);
    }
    await user.save({ validateBeforeSave: false });
    throw new UnauthorizedError("Invalid email or password");
  }

  // Reset login attempts on success
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  const tokens = await generateTokenPair(user);

  await auditService.createAuditLog({
    userId: user._id.toString(),
    userName: user.name,
    userEmail: user.email,
    action: "LOGIN",
    resource: "User",
    description: "User logged in successfully",
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    ...tokens,
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const tokens = await generateTokenPair(user);

  return tokens;
};

const logout = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { refreshToken: undefined },
    { new: false },
  );
  if (user) {
    await auditService.createAuditLog({
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      action: "LOGOUT",
      resource: "User",
      description: "User logged out",
    });
  }
};

const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  } as any);

  if (!user) {
    throw new BadRequestError("Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    // Return success even if user not found (security: don't reveal user existence)
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new BadRequestError("Failed to send reset email. Try again later.");
  }
};

const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  } as any);

  if (!user) {
    throw new BadRequestError("Invalid or expired reset token");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  return user;
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new NotFoundError("User");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new BadRequestError("Current password is incorrect");
  }

  user.password = newPassword;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  return user;
};

// --- Profile operations ---
const getProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  return user;
};

const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string },
) => {
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new NotFoundError("User");
  return user;
};

// --- Admin operations ---
const getAllUsers = async (query: {
  search?: string;
  role?: string;
  isActive?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User");
  return user;
};

const updateUser = async (
  id: string,
  data: { name?: string; role?: string; isActive?: boolean; phone?: string },
) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new NotFoundError("User");
  return user;
};

const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new NotFoundError("User");
  return user;
};

export const userService = {
  register,
  login,
  refreshAccessToken,
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
