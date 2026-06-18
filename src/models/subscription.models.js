import mongoose from "mongoose"
import { User } from "./user.models.js"



const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }
},
{
    timestamps: true
})

// uniqueness
subscriptionSchema.index(
    { subscriber: 1, channel: 1 },
    { unique: true }
);


export const Subscription = mongoose.model("Subscription", subscriptionSchema)