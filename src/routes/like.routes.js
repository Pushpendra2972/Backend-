import { Router } from "express";
import { toggleVideoLike ,
         toggleCommentLike ,
         toggleTweetLike ,
         getLikedVideos } from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";



const router = Router()

// routes
router.route("/video/:videoId").post(verifyJWT, toggleVideoLike)
router.route("/comment/:commentId").post(verifyJWT, toggleCommentLike)
router.route("/tweet/:tweetId").post(verifyJWT, toggleTweetLike)
router.route("/videos").get(verifyJWT, getLikedVideos)





export default router