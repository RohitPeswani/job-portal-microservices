import { tryCatch } from "../utils/tryCatch.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { getBuffer } from "../utils/buffer.js";
import axios from "axios";

export const myProfile = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    return res.status(200).json({
        success : true,
        user
    });

})

export const getUserProfile = tryCatch(async(req : AuthenticatedRequest, res, next) => {
   const {userId} = req.params;

   const users = await sql`SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills, u.subscription, u.created_at FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id`;

   if(users.length === 0){
    return next(new ErrorHandler(404, "User not found"));
   }

   const user = users[0];
   user.skills = user.skills || [];

   return res.status(200).json({
    success : true,
    user
   });
})

export const updateUserProfile = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;
    
    if(!user){
        return next(new ErrorHandler(401, "Authentication required"));
    }

    const {name, phone_number, bio} = req.body;

    const newName = name || user.name;
    const newPhone = phone_number || user.phone_number;
    const newBio = bio || user.bio;

    const [updatedUser] = await sql`UPDATE users SET name = ${newName}, phone_number = ${newPhone}, bio = ${newBio} WHERE user_id = ${user.user_id} RETURNING user_id, name,email, phone_number, bio`;

    return res.status(200).json({
        success : true,
        updatedUser
    });
})

export const updateProfilePic = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;
    
    if(!user){
        return next(new ErrorHandler(401, "Authentication required"));
    }

    const file = req.file;



    if(!file){
        return next(new ErrorHandler(400, "File is required"));
    }


    const oldPublicId = user.profile_pic_public_id;

    const buffer = getBuffer(file);


    if(!buffer){
        return next("failed to generate content");
    }

    const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {
        buffer,
        public_id : oldPublicId
    });

    const [updatedUser] = await sql`UPDATE users SET profile_pic = ${data.url}, profile_pic_public_id = ${data.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, profile_pic`;

    return res.status(200).json({
        success : true,
        updatedUser
    });
})

export const updateResume = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;
    
    if(!user){
        return next(new ErrorHandler(401, "Authentication required"));
    }

    const file = req.file;



    if(!file){
        return next(new ErrorHandler(400, "File is required"));
    }


    const oldPublicId = user.resume_public_id;

    const buffer = getBuffer(file);


    if(!buffer){
        return next("failed to generate content");
    }

    const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {
        buffer,
        public_id : oldPublicId
    });

    const [updatedUser] = await sql`UPDATE users SET resume = ${data.url}, resume_public_id = ${data.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, resume`;

    return res.status(200).json({
        success : true,
        updatedUser
    });
})

export const addSkillToUser = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const userId = req.user?.user_id;

    if(!userId){
        return res.status(401).json({
            success : false,
            message : "Unauthorized"
        });
    }

    const {skill} = req.body;

    if(!skill || skill.trim() === ""){
        return res.status(400).json({
            success : false,
            message : "Skill is required"
        });
    }  

})