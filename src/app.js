import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({   // to handle cross origin
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())



// routs import
import userRouter from "./routes/user.routs.js"
import subscriptionRouter from "./routes/subscription.routs.js"
import videoRouter from "./routes/video.routes.js"


//routs declaration
app.use("/api/v1/users", userRouter )
app.use("/api/v1/subscriptions", subscriptionRouter )
app.use("/api/v1/videos", videoRouter )



export default app