import { Router } from "express";
import { createTweet ,
         getUserTweets ,
         updateTweet ,
         deleteTweet } from "../controllers/tweet.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";



const router = Router()

// routes
router.route("/").post(verifyJWT, createTweet)
router.route("/user/:userId").get(verifyJWT, getUserTweets)
router.route("/:tweetId").patch(verifyJWT, updateTweet)
router.route("/:tweetId").delete(verifyJWT, deleteTweet)



export default router