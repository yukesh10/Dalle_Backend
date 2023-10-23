import Post from '../mongodb/models/post.js';

export const numOfPostByUser = async(userId) => {
    const numOfPost = await Post.aggregate([
        {
            $match: { userId }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]);
    return numOfPost.length;
}