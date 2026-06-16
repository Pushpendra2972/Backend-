import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


   //TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, 
        sortBy = "createdAt", sortType = "desc", userId
    } = req.query;

    const matchStage = {
        isPublished: true
    };

    // Search by title
    if (query?.trim()) {
        matchStage.title = {
            $regex: query,
            $options: "i"
        };
    }

    // Filter by owner
    if (userId) {

        if (!isValidObjectId(userId)) {
            throw new ApiError(
                400,
                "Invalid user id"
            );
        }

        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const aggregate = Video.aggregate([
        {
            $match: matchStage
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
            $sort: {
                [sortBy]:
                    sortType === "asc"
                        ? 1
                        : -1
            }
        }
    ]);

    const options = {
        page: Number(page),
        limit: Number(limit)
    };

    const videos = await Video.aggregatePaginate(
            aggregate,
            options
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );
});

    // TODO: get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath =
        req.files?.videoFile?.[0]?.path;

    const thumbnailLocalPath =
        req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(500, "Video upload failed");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video uploaded successfully"
        )
    );
});

    //TODO: get video by id
const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    await Video.findByIdAndUpdate(
         videoId,
         {
             $inc: {
                   views: 1
             }
         }
     );

    const video = await Video.findById(videoId)
    .populate(
        "owner",
        "username fullName avatar"
    );
    

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    );
});

    //TODO: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { title, description } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    if (title) {
        video.title = title;
    }

    if (description) {
        video.description = description;
    }

    const thumbnailLocalPath = req.file?.path;

    if (thumbnailLocalPath) {

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail = thumbnail.url;
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )
    );
});

    //TODO: delete video
const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if ( video.owner.toString() !== req.user._id.toString() ) {
        throw new ApiError(403, "Unauthorized");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if ( video.owner.toString() !== req.user._id.toString() ) {
        throw new ApiError(403, "Unauthorized");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Publish status updated"
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}