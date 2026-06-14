import { Request, Response } from "express"
import cloudinary from 'cloudinary';
export const uploadFileController = async (req: Request, res: Response)=> {
    try {
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
    } catch (error : any) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}