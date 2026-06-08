import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import uploadFile from '../middlewares/multer.js';
import { createCompany } from '../controllers/job.js';

const router = express.Router();

router.post('/company', isAuthenticated, uploadFile, createCompany);

export default router;