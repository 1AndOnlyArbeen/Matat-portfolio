import mongoose from "mongoose";

const gallery = new mongoose.Schema({
    caption:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
},{timestamps:true})

const Gallery = mongoose.model('Gallery',gallery)
export {Gallery}