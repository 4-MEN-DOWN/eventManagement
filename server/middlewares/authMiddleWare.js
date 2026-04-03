import { User } from "../models/userModel.js";
import catchAsyncError from "./catchAsyncError.js";

import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

export const authMiddleWare = catchAsyncError(async (req, res, next) => {
  let token;

  // 1️⃣ Check Authorization header first
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2️⃣ Fallback to cookie (if any)
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorHandler("User is not Authenticated", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User with this role (${req.user.role}) is not allowed to access this resource`,
          400
        )
      );
    }
    next();
  };
};
