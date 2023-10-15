import mongoose from "mongoose";

const TokenSchema = mongoose.model('Token', new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    token: {type: String, required: true},
    refreshToken: {type: String, required: true}
}));

export default TokenSchema;