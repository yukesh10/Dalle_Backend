import express from 'express';
import * as dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';

import Post from '../mongodb/models/post.js';
import auth from '../middlewares/auth.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

router.route('/').get(async (req, res) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    "user.email": 0,
                    "user.password": 0
                }
            }
        ]);
        res.status(200).json({success: true, data:posts});
    } catch(error){
        console.error(error);
        res.status(500).json({success: false, message: error});
    }
})

router.route('/').post(auth, async (req, res) => {
  
    try {
        const { prompt, photo} = req.body;
        const {authUser} = req;
        const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Post.create({
            userId: authUser?.userId, 
            prompt, 
            photo: photoUrl.url
        })
        res.status(201).json({success: true, data: newPost});
    } catch(error){
        console.error(error);
        res.status(500).json({success: false, message: error});
    }

})

export default router;