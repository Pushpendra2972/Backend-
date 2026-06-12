import Router from "express"
import { registerUser } from "../controllers/user.controllers.js"
import { loginUser } from "../controllers/user.controllers.js" 
import { logoutUser } from "../controllers/user.controllers.js"
import { refreshAccessToken } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
           name: "avatar",
           maxCount: 1
        },
        {
           name: "coverImage",
           maxCount: 1
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)
// secured
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refreshToken").post(refreshAccessToken)


export default router