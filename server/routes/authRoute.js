import express from "express";
import {
  forgotPassword,
  getUser,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  verfiyOtp,
} from "../controllers/authController.js";
import { authMiddleWare } from "../middlewares/authMiddleWare.js";
const authRouter = express.Router();
authRouter.route("/register").post(register);
authRouter.route("/send-token").post(verfiyOtp);
authRouter.route("/login").post(login);
authRouter.route("/logout").get(authMiddleWare, logout);
authRouter.route("/me").get(authMiddleWare, getUser);
authRouter.route("/forgot/password").post(forgotPassword);
authRouter.route("/password/reset/:token").put(resetPassword);
authRouter.route("/password/update").put(authMiddleWare, updatePassword);
export default authRouter;
