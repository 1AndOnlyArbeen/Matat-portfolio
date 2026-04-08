import mongoose, { model } from "mongoose";


const hero = new mongoose.Schema({
    title :{
        type:Sting,
        required:true,
    },
    subtitle:{
        type:String,
        required:true,
        
    },
    buttonText:{
        type:String,
        required:true
    },
    buttonLink:{
        type:String,
        required:true,
    },
    backgroundImage:{
        type:String,
        required:true,
    }
},{timestamps:true})

const Hero = mongoose.model('Hero',hero)
export {Hero}