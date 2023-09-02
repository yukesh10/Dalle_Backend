import mongoose from "mongoose";

const PostSchema = mongoose.model('Post', new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    prompt: {type: String, required: true},
    photo: {type: String, required: true}
}));

export default PostSchema;