import express from "express";
import { generateBanner } from "../controllers/bannerController.js";

const bannerRouter = express.Router();
bannerRouter.post("/generate", generateBanner);

export default bannerRouter;
