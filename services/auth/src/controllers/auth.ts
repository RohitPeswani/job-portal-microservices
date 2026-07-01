import { Request, Response } from "express";
import { tryCatch } from "../utils/tryCatch.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from 'bcrypt';
import { getBuffer } from "../utils/buffer.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import { forgotPasswordTemplate } from "../forgotPasswordTemplate.js";
import { redisClient } from "../index.js";

export const registerUser = tryCatch(async(req  , res , next) => {
    const {name, email, password, phoneNumber, role, bio} = req.body;

    if(!name || !email || !password || !phoneNumber || !role){
        return next(new ErrorHandler(400, "All fields are required"));
    }

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

    if(existingUser.length > 0){
        return next(new ErrorHandler(409, "User with this email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let registerUser;

    if(role === 'jobseeker'){
        const file = req.file;

        if(!file){
            return next(new ErrorHandler(400, "File is required"));
        }

        const buffer = getBuffer(file);


        if(!buffer){
            return next(new ErrorHandler(400, "Buffer is required"));
        }

        const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {buffer});
        registerUser = await sql`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id}) RETURNING user_id, name, email, phone_number, role, bio, resume, created_at`;
       
    }
    else if(role === 'recruiter'){
        registerUser = await sql`INSERT INTO users (name, email, password, phone_number, role) VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}) RETURNING user_id, name, email, phone_number, role, created_at`;
    }

     return res.status(200).json({
        success : true,
        message : "user registered successfully",
        registerUser,

    });

    

})

export const loginUser = tryCatch(async(req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler(400, "All fields are required"));
    }

    const existingUser = await sql`SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.email = ${email} GROUP BY u.user_id`;

    if(existingUser.length === 0){
        return next(new ErrorHandler(404, "User not found"));
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser[0].password);

    if(!isPasswordValid){
        return next(new ErrorHandler(401, "Invalid credentials"));
    }
    existingUser[0].skills = existingUser[0].skills || [];

    delete existingUser[0].password;

    const token = jwt.sign({id : existingUser[0].user_id}, process.env.JWT_SECRET as string, {expiresIn : "1d"});

    return res.status(200).json({
        success : true,
        message : "user logged in successfully",
        existingUser,
        token
    });
})

export const forgotPassword = tryCatch(async(req, res, next) => {
    const {email} = req.body;

    if(!email){
        return next(new ErrorHandler(400, "Email is required"));
    }

    const existingUser = await sql`SELECT user_id, email FROM users WHERE email = ${email}`;

    if(existingUser.length === 0){
        return next(new ErrorHandler(400, "User not found"));
    }

    const user = existingUser[0];

    const resetToken = jwt.sign(
        {
        email : user.email,
        type:"reset"
        },
        process.env.JWT_SECRET as string,
        {expiresIn : "15m"}
    );



    const resetLink = `${process.env.FRONTEND_URL}/reset?token=${resetToken}`;


    await redisClient.set(`forgot:${email}`, resetToken, {EX : 15 * 60});

    const message = {
        to : email,
        subject : "RESET Your Password - hireheaven",
        html : forgotPasswordTemplate(resetLink)
    }

    await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/send-email`, message);

    return res.status(200).json({
        message : "If user exists, a mail has been sent"
    });

   
})

export const resetPassword = tryCatch(async(req, res, next) => {
    const {token, password} = req.body;

    if(!token || !password){
        return next(new ErrorHandler(400, "All fields are required"));
    }

    let decodedToken;
    try{
        decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    }catch(error){
        return next(new ErrorHandler(400, "Invalid token"));
    }

    if(typeof decodedToken === "string"){
        return next(new ErrorHandler(400, "Invalid token"));
    }

    console.log(decodedToken);

    if(decodedToken.type !== "reset"){
        return next(new ErrorHandler(400, "Invalid token"));
    }

    const storedToken = await redisClient.get(`forgot:${decodedToken.email}`);

    if(!storedToken || storedToken !== token){
        return next(new ErrorHandler(400, "Invalid token"));
    }

    const user = await sql`SELECT user_id, email FROM users WHERE email = ${decodedToken.email}`;

    if(user.length === 0){
        return next(new ErrorHandler(400, "User not found"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`UPDATE users SET password = ${hashedPassword} WHERE email = ${decodedToken.email}`;

    await redisClient.del(`forgot:${decodedToken.email}`);

    return res.status(200).json({
        message : "Password reset successfully"
    });
})