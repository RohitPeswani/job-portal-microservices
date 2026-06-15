import nodemailer from "nodemailer";
import { Request, Response } from "express";
import cloudinary from 'cloudinary';
import { GoogleGenAI } from '@google/genai';
import { guidancePrompt, resumePrompt } from "../utils/template.js";
import { tryCatch } from "../utils/tryCatch.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import dotenv from 'dotenv';
import { getBuffer } from "../utils/buffer.js";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey : process.env.GEMINI_API_KEY
});


export const sendEmail = tryCatch(async(req, res) => {
    
        const { to, subject, html } = req.body;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: "HireHeaven <no-reply@hireheaven.com>",
            to,
            subject,
            html
        });

        return res.status(200).json({
            success: true
        });

     
});

export const uploadFileController = tryCatch(async (req, res)=> {
   
        const {buffer, public_id} = req.body;

        if(public_id){
            await cloudinary.v2.uploader.destroy(public_id);

            return res.status(200).json({
                success : true,
                message : "File deleted successfully"
            })
        }
        if(buffer){
            const cloud = await cloudinary.v2.uploader.upload(buffer);
        

        return res.status(200).json({
            success: true,
            url: cloud.secure_url,
            public_id: cloud.public_id
        })
    }
});


const parseJson = (text: string) => {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};
export const carrerGuidance = tryCatch(async(req, res, next) => {
   
        const {skills} = req.body;

        if(!skills){
            return res.status(400).json({
                success: false,
                message: "skills are required"
            });
        }


       
        const response = await ai.models.generateContent({
            model : "gemini-2.5-flash",
            contents : guidancePrompt(skills)
        })

        let jsonResponse;

        const rawText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();

        if(!rawText){
            return res.status(500).json({
                success: false,
                message: "Failed to generate career guidance"
            });
        }

        
            jsonResponse = parseJson(rawText);

            if(!jsonResponse){
               next(new ErrorHandler(500, "Failed to parse career guidance"));
               return;
            }
        

        return res.status(200).json({
            success: true,
            data: jsonResponse
        });

    
});

export const analyzeResume = tryCatch(async(req, res, next) => {
   
        const file = req.file;

        if(!file){
            return res.status(400).json({
                success: false,
                message: "resume is required"
            });
        }


        const buffer = getBuffer(file);

       
        const response = await ai.models.generateContent({
            model : "gemini-2.5-flash",
            contents : [{
                role : "user",
                parts : [
                    {
                        text : resumePrompt()
                    },
                    {
                        inlineData : {
                            mimeType : "application/pdf",
                            data : buffer.replace("data:application/pdf;base64,", "")
                        }
                    }
                ]
            }]
        })

        let jsonResponse;

        const rawText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();

        if(!rawText){
            return res.status(500).json({
                success: false,
                message: "Failed to generate resume analysis"
            });
        }

        
            jsonResponse = parseJson(rawText);

            if(!jsonResponse){
               next(new ErrorHandler(500, "Failed to parse resume analysis"));
               return;
            }
        

        return res.status(200).json({
            success: true,
            data: jsonResponse
        });

    
});