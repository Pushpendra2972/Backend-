import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getAllTweets = asyncHandler(async (req, res) => {

    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                isLiked: {
                    $in: [
                        req.user._id,
                        "$likes.likedBy"
                    ]
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);
    

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "Tweets fetched successfully"
        )
    );

});

    //TODO: create tweet
const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(
            400,
            "Tweet content is required"
        );
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    });

    const populatedTweet = await tweet
       .populate(
            "owner", "username fullName avatar"
       );

    return res.status(201).json(
        new ApiResponse(
            201,
            populatedTweet,
            "Tweet created successfully"
        )
    );
});
      // TODO: get user tweets
const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user id"
        );
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                isLiked: {
                    $in: [
                        req.user._id,
                        "$likes.likedBy"
                    ]
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);
    
    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "Tweets fetched successfully"
        )
    );
});

    //TODO: update tweet
const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    tweet.content = content.trim();

    await tweet.save();

    await tweet.populate(
       "owner",
       "username fullName avatar"
     );

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    );
});

    //TODO: delete tweet
const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    );
});

export {
    getAllTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}