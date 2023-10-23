import express from 'express';
import * as dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';

import Post from '../mongodb/models/post.js';
import auth from '../middlewares/auth.js';
import User from '../mongodb/models/user.js';

import {numOfPostByUser} from '../utils/utils.js';

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
        return res.status(200).json({success: true, data:posts});
    } catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: error});
    }
})

router.route('/').post(auth, async (req, res) => {
  
    try {
        const { prompt, photo} = req.body;
        const {authUser} = req;

        let numOfPost = await numOfPostByUser(authUser.userId);
        
        const user = await User.findOne({email: authUser.email});

        if (user.maxPost <= numOfPost){
            return res.status(401).json({success: false, message: "User has exceeded the max post limit of " + user.maxPost})
        }

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Post.create({
            userId: authUser?.userId, 
            prompt, 
            photo: photoUrl.url
        })
        return res.status(201).json({success: true, data: {currentPost: ++numOfPost, newPost}});
    } catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: error});
    }

})

export default router;