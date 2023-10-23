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
                error: "INVALID_TOKEN"
            })
        }

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN);
        const current = new Date();
        const tokenExp = new Date(decodedToken.exp *1000);
        if (tokenExp < current){
            return res.status(401).json({
                error: "REFRESH_TOKEN_EXPIRED"
            })
        }
        req.authUser = decodedToken;
        next();
    } catch(error){
        res.status(401).json({
            error: "INVALID_REQUEST"
        })
    }
}

export default auth;