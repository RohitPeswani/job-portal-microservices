import express from 'express';
import { uploadFileController } from '../controllers/upload.js';

const routes = express.Router();

routes.post('/upload', uploadFileController);

export default routes;
