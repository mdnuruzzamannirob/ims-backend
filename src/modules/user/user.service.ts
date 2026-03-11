import jwt from "jsonwebtoken";
import { User, IUser } from "./user.model";
import config from "../../config";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../core/errors";

const generateToken = (user: IUser): string => {
  return jwt.sign({ userId: user._id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
};

const register = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const user = await User.create(data);
  const token = generateToken(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

const login = async (data: { email: string; password: string }) => {
  const user = await User.findOne({ email: data.email, isActive: true }).select(
    "+password",
  );
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

const getProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User");
  }
  return user;
};

export const userService = { register, login, getProfile };
