import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  res.json({
    message: 'Image uploaded',
    url: req.file.path,
    publicId: req.file.filename,
  });
});

export default router;
