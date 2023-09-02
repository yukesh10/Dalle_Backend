import express from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../mongodb/models/user.js';

dotenv.config();

const router = express.Router();

router.route("/signup").post(async(req, res) => {
    const {name, email, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({
            name, 
            email,
            password: hashedPassword
        });
        user = await user.save();
        res.status(201).json({success: true, message: "User created successfully", user});
    } catch(error){
        console.error(error);
        res.status(500).json({success: false, message: "Error creating user", error});
    }
    
})

router.route("/login").post(async(req, res) => {

    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if (!user){
            res.status(404).json({success: false, message: "User not found"});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch){
            res.status(400).json({success: false, message: "Password does not match"});
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email
        },process.env.JWT_TOKEN, {expiresIn: process.env.JWT_EXP})

        res.status(200).json({
            success: true,
            message: "Login successful",
            email: user.email,
            id: user._id,
            name: user.name,
            token
        })
    } catch(error){
        console.log(error);
        res.status(500).json({success: false, message: "Error logging user", error});
    }

})

export default router;