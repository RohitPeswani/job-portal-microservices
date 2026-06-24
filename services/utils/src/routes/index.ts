import express from 'express';
import { analyzeResume, carrerGuidance, sendEmail, uploadFileController } from '../controllers/utils.js';
import uploadFile from '../middlewares/multer.js';

const routes = express.Router();

routes.post('/upload', uploadFileController);
routes.post('/send-email', sendEmail);
routes.post('/career-guidance', carrerGuidance);
routes.post('/analyze-resume', uploadFile, analyzeResume);

export default routes;
