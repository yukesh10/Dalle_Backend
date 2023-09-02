import mongoose from "mongoose";

const UserSchema = mongoose.model('User', new mongoose.Schema({
    name: {type: String, required: [true, "Please provide your name!"]},
    email: {type: String, required: [true, "Please provide your email address!"], unique: [true, 'Email already exists']},
    password: {type: String, required: [true, "Please provide your password!"]},
    createdAt: {type: Date, default: Date.now}
}));

export default UserSchema;