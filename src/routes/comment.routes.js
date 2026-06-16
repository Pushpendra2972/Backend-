import { Router } from "express";
import { getVideoComments ,
         addComment ,
         updateComment ,
         deleteComment } from "../controllers/comment.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";



const router = Router()

//routes
router.route("/:videoId").get(getVideoComments)
router.route("/:videoId").post(verifyJWT, addComment)
router.route("/:commentId").patch(verifyJWT, updateComment)
router.route("/:commentId").delete(verifyJWT, deleteComment)



export default router