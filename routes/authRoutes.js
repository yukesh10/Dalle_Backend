import express from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../mongodb/models/user.js';
import Token from '../mongodb/models/token.js';
import TokenSchema from '../mongodb/models/token.js';

dotenv.config();

const router = express.Router();

router.route("/signup").post(async(req, res) => {
    const {name, email, password} = req.body;
    try {

        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(500).json({success: false, message: "User with this email address already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({
            name, 
            email,
            password: hashedPassword
        });
        user = await user.save();
        return res.status(201).json({success: true, message: "User created successfully", user});
    } catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: "Error creating user", error});
    }
    
})

const saveTokenOnDatabase = async (token, refreshToken, user) => {
    const tokenRecord = {
        token,
        userId: user._id,
        refreshToken
    }
    await Token.create(tokenRecord);
}

router.route("/login").post(async(req, res) => {

    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if (!user){
            return res.status(404).json({success: false, message: "User not found"});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch){
            return res.status(400).json({success: false, message: "Password does not match"});
        }

        const accessToken = jwt.sign({
            userId: user._id,
            email: user.email
        },process.env.JWT_TOKEN, {expiresIn: process.env.JWT_ACCESS_EXP})

        const refreshToken = jwt.sign({
            userId: user._id,
            email: user.email
        },process.env.JWT_REFRESH_TOKEN, {expiresIn: process.env.JWT_REFRESH_EXP})

        await saveTokenOnDatabase(accessToken, refreshToken, user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            email: user.email,
            id: user._id,
            name: user.name,
            token: accessToken,
            refresh: refreshToken
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Error logging user", error});
    }

})

router.route('/refresh-token').post(async(req, res)=> {
    try {
        const {refreshToken, userId} = req.body;
        const tokenOnDb = await TokenSchema.findOne({refreshToken, user: userId});
        if (!tokenOnDb){
            return res.status(401).json({
                error: new Error("Invalid refresh token")
            })
        }

        const decodedToken = await jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
        const current = new Date();
        const tokenExp = new Date(decodedToken.exp *1000);
        if (tokenExp < current){
            return res.status(401).json({
                error: new Error("Token expired. Please relogin.")
            })
        }
        
        const user = await User.findOne({email: decodedToken?.email})
        const accessToken = jwt.sign({
            userId: user._id,
            email: user.email
        },process.env.JWT_TOKEN, {expiresIn: process.env.JWT_ACCESS_EXP})
        
        await TokenSchema.updateOne({refreshToken, user: userId}, {$set: { token: accessToken }});

        return res.status(200).json({
            token: accessToken
        })
    } catch(err){
        res.status(401).json({
            error: new Error("Invalid request")
        })
    }
})

export default router;