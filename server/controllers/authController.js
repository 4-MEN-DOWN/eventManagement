import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import dotenv from "dotenv";
dotenv.config();

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all input fields", 400));
  }

  // 2. Check for duplicate verified email
  const userRegistered = await User.findOne({ email, accountVerified: true });
  if (userRegistered) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  // 3. Check for duplicate username (case-insensitive)
  const existingUsername = await User.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") }, // case-insensitive check
    accountVerified: true,
  });
  if (existingUsername) {
    return next(
      new ErrorHandler(
        "Username already taken. Please choose another one.",
        400
      )
    );
  }

  // 4. Prevent multiple unverified registration attempts
  const registrationAttemptsByUser = await User.find({
    email,
    accountVerified: false,
  });

  if (registrationAttemptsByUser.length > 0) {
    return next(
      new ErrorHandler("You have exceeded registration attempts", 400)
    );
  }

  // 5. Validate password length
  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler("Password must be 8–16 characters long", 400));
  }

  // 6. Create new user
  const user = await User.create({ name, email, password });

  // 7. Generate and assign verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  user.verificationCode = verificationCode;
  user.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  // 8. Send verification email
  sendVerificationCode(verificationCode, email, res);
});

// ✅ Verify OTP
export const verfiyOtp = catchAsyncError(async (req, res, next) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    return next(new ErrorHandler("OTP or Email is missing", 400));
  }

  const userEntries = await User.find({ email, accountVerified: false }).sort({
    createdAt: -1,
  });
  if (!userEntries || userEntries.length === 0) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  let user = userEntries[0];
  if (userEntries.length > 1) {
    await User.deleteMany({
      _id: { $ne: user._id },
      email,
      accountVerified: false,
    });
  }

  if (user.verificationCode !== Number(otp)) {
    return next(
      new ErrorHandler(
        "Invalid OTP . Please check your email and enter the correct OTP number",
        400
      )
    );
  }

  if (Date.now() > new Date(user.verificationCodeExpire).getTime()) {
    return next(new ErrorHandler("OTP Expired", 400));
  }

  user.verificationCode = null;
  user.accountVerified = true;
  user.verificationCodeExpire = null;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account Verified and Logged In Successfully", res);
});

// ✅ Login
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter email and password", 400));

  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );
  if (!user) return next(new ErrorHandler("User not found", 400));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler("Incorrect password", 400));

  sendToken(user, 200, "Login successful", res);
});

// ✅ Logout
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
    })
    .status(200)
    .json({ success: true, message: "Logged Out Successfully" });
});

// ✅ Get Authenticated User
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// ✅ Forgot Password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Email is required", 400));

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) return next(new ErrorHandler("Invalid email", 400));

  const resetToken = user.getThePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = generateForgotPasswordEmailTemplate(resetURL);

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email failed to send", 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token invalid or expired", 400));
  }

  user.password = password; // ✅ Do NOT hash manually
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save(); // pre("save") middleware hashes it automatically

  sendToken(user, 200, "Password Reset Successful", res);
});

// ✅ Update Password
export const updatePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword); // ✅ Use method
  if (!isMatch)
    return next(new ErrorHandler("Current password is incorrect", 400));

  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler("New passwords do not match", 400));
  }

  user.password = newPassword; // ✅ Do NOT hash manually
  await user.save(); // pre("save") middleware hashes it automatically

  res
    .status(200)
    .json({ success: true, message: "Password Updated Successfully" });
});
