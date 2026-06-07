import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

console.log("MONGO URL =", process.env.MONGODB_URL);

 const connectDB = async () => {
    try{
         const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
         console.log(`\n MONGODB connected !! DB HOST: ${connectionInstances.connection.host}`)
    } catch (error) {
       console.log("MONGODB connection FAILED", error);
       process.exit(1)
    }
}

export default connectDB