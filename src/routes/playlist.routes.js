import { Router } from "express";
import { createPlaylist ,
         getUserPlaylists ,
         getPlaylistById ,
         addVideoToPlaylist ,
         removeVideoFromPlaylist ,
         deletePlaylist ,
         updatePlaylist } from "../controllers/playlist.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router()

// routes
router.route("/").post(verifyJWT, createPlaylist)
router.route("/user/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById)
router.route("/add/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist)
router.route("/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/:playlistId").patch(verifyJWT, updatePlaylist)



export default router