import { Router } from "express";
import { toggleSubscription ,
         getUserChannelSubscribers ,
         getSubscribedChannels} from "../controllers/subscription.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router()

//routers
router.route("/c/:channelId").post(verifyJWT, toggleSubscription)
router.route("/channel/:channelId").get(verifyJWT, getUserChannelSubscribers)
router.route("/user/:subscriberId").post(verifyJWT, getSubscribedChannels)


export default router