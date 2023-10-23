import Post from '../mongodb/models/post.js';

export const numOfPostByUser = async(userId) => {
    const numOfPost = await Post.find({userId}).count();
    return numOfPost;
}