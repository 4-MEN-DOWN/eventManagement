import multer from "multer";
import path from "path";

// ---------- EVENT BANNERS ----------
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/event-banners"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `event-${Date.now()}${ext}`);
  },
});

export const uploadBanner = multer({
  storage: eventStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ---------- AD BANNERS ----------
const adStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/ad-banners"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ad-${Date.now()}${ext}`);
  },
});

export const uploadAdBanner = multer({
  storage: adStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
