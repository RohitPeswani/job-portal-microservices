import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { addSkillToUser, deleteSkillFromUser, getUserProfile, myProfile, updateProfilePic, updateResume, updateUserProfile } from '../controllers/user.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router();


router.post('/my-profile', isAuthenticated, myProfile);
router.post('/profile/:userId', isAuthenticated, getUserProfile);
router.put('/update-profile', isAuthenticated, updateUserProfile);
router.put('/update-profile-pic', isAuthenticated,uploadFile, updateProfilePic);
router.put('/update-resume', isAuthenticated, uploadFile, updateResume);
router.post('/skills', isAuthenticated, addSkillToUser);
router.delete('/skills', isAuthenticated, deleteSkillFromUser);
export default router;