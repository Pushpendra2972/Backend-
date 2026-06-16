import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


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

    return res.status(201).json(
        new ApiResponse(
            201,
            tweet,
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

    const tweets = await Tweet
        .find({
            owner: userId
        })
        .populate(
            "owner",
            "username fullName avatar"
        )
        .sort({
            createdAt: -1
        });

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

    tweet.content = content;

    await tweet.save();

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
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}