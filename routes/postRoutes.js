import express from 'express';
import * as dotenv from 'dotenv';

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

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

export default router;