import express from 'express';
import { uploadFileController } from '../controllers/upload.js';
import { sendEmail } from '../controllers/email.js';

const routes = express.Router();

routes.post('/upload', uploadFileController);
routes.post('/send-email', sendEmail);

export default routes;
