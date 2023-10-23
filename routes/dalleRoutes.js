import express from 'express';
import * as dotenv from 'dotenv';
import {Configuration, OpenAIApi} from 'openai';

import User from '../mongodb/models/user.js';

import {numOfPostByUser} from '../utils/utils.js'

dotenv.config();

const router = express.Router();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

router.route('/').post(async (req, res) => {
    try {
        const {prompt} = req.body;
        const {authUser} = req;
        
        const user = await User.findOne({email: authUser.email});
        const numOfPost = await numOfPostByUser(user.userId);

        if (user.maxPost <= numOfPost){
            return res.status(401).json({success: false, message: "User has exceeded the max post limit of " + user.maxPost})
        }

        const aiResponse = await openai.createImage({
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
        });

        const image = aiResponse.data.data[0].b64_json;

        res.status(200).json({photo: image})

    } catch(error){
        console.error(error);
        console.log(error?.response.data.error.message);
        res.status(500).send(error?.response.data.error.message);
    }
})

export default router;