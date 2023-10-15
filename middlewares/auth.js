import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import TokenSchema from '../mongodb/models/token.js';

dotenv.config();

const auth = async (req, res, next) => {
    try {
        const token = await req.headers.authorization.split(" ")[1];
        const tokenOnDb = await TokenSchema.findOne({token});
        if (!tokenOnDb){
            return res.status(401).json({
                error: new Error("Invalid Token")
            })
        }

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN);
        const current = new Date();
        const tokenExp = new Date(decodedToken.exp *1000);
        if (tokenExp < current){
            return res.status(401).json({
                error: new Error("Token expired. Please relogin.")
            })
        }
        req.authUser = decodedToken;
        next();
    } catch(error){
        res.status(401).json({
            error: new Error("Invalid request")
        })
    }
}

export default auth;