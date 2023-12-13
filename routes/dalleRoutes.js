import express from 'express';
import * as dotenv from 'dotenv';
import {Configuration, OpenAIApi} from 'openai';
import {v2 as cloudinary} from 'cloudinary';

import User from '../mongodb/models/user.js';
import Post from '../mongodb/models/post.js';

import {numOfPostByUser} from '../utils/utils.js'

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

router.route('/').post(async (req, res) => {
    try {
        const {prompt} = req.body;
        const {authUser} = req;
        
        const user = await User.findOne({email: authUser.email});
        const numOfPost = await numOfPostByUser(user.id);

        if (user.maxPost <= numOfPost){
            return res.status(401).json({success: false, message: "User has exceeded the max post limit of " + user.maxPost})
        }

        const aiResponse = await openai.createImage({
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
        });

        const base64Image = aiResponse.data.data[0].b64_json;

        const photoUrl = await cloudinary.uploader.upload('data:image/jpeg;base64,' + base64Image);

        const newPost = await Post.create({
            userId: authUser?.userId, 
            prompt, 
            photo: photoUrl.url
        })
        return res.status(201).json({success: true, data: { newPost }});
    } catch(error){
        res.status(500).send("Failed");
    }
})

export default router;