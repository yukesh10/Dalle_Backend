import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const auth = async (req, res, next) => {
    try {
        const token = await req.headers.authorization.split(" ")[1];
        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN);
        const user = await decodedToken;
        req.authUser = user;
        next();
    } catch(error){
        res.status(401).json({
            error: new Error("Invalid request")
        })
    }
}

export default auth;