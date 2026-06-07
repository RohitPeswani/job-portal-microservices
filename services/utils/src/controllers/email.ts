import nodemailer from "nodemailer";
import { Request, Response } from "express";

export const sendEmail = async(req: Request, res: Response) => {
    try {
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

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false
        });
    }
};