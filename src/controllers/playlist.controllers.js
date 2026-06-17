import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"

    //TODO: create playlist
const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(
            400,
            "Name and description are required"
        )
    }

    const existingPlaylist = await Playlist.findOne({
            owner: req.user._id,
            name
        })

    if (existingPlaylist) {
        throw new ApiError(
            409,
            "Playlist already exists"
        )
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )
})

     //TODO: get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user id"
        )
    }

    const playlists = await Playlist.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId( userId )
                }
            },
            {
                $addFields: {
                    totalVideos: {
                        $size: "$videos"
                    }
                }
            }
        ])

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully"
        )
    )
})

      //TODO: get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist id"
        )
    }

    const playlist =
        await Playlist.aggregate([
            {
                $match: {
                    _id:
                        new mongoose.Types.ObjectId(
                            playlistId
                        )
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos",

                    pipeline: [
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
                            $project: {
                                title: 1,
                                thumbnail: 1,
                                duration: 1,
                                views: 1,
                                owner: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    totalVideos: {
                        $size: "$videos"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    videos: 1,
                    totalVideos: 1,
                    owner: 1,
                    createdAt: 1
                }
            }
        ])

    if (!playlist.length) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist[0],
            "Playlist fetched successfully"
        )
    )
})

    // TODO: add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid id"
        )
    }

    const playlist = await Playlist.findById( playlistId )

    if (!playlist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "Unauthorized"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $addToSet: {
                    videos: videoId
                }
            },
            {
                new: true
            }
        )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added successfully"
        )
    )
})

     // TODO: remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId) ) {
        throw new ApiError(
            400,
            "Invalid id"
        )
    }

    const playlist = await Playlist.findById( playlistId )

    if (!playlist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "Unauthorized"
        )
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull: {
                    videos: videoId
                }
            },
            {
                new: true
            }
        )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed successfully"
        )
    )
})

    // TODO: delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist id"
        )
    }

    const playlist = await Playlist.findById( playlistId )

    if (!playlist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "Unauthorized"
        )
    }

    await Playlist.findByIdAndDelete( playlistId )

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
})

    //TODO: update playlist
const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist id"
        )
    }

    const playlist = await Playlist.findById( playlistId )

    if (!playlist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "Unauthorized"
        )
    }

    if (name?.trim()) {
        playlist.name = name
    }

    if (description?.trim()) {
        playlist.description = description
    }

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}